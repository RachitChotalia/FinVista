from fastapi import FastAPI, HTTPException, WebSocket, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import numpy as np
import yfinance as yf
import asyncio
import os
import json
import requests  # Ensure you ran: pip install requests
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURATION ---
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SECRET_KEY = "YOUR_SUPER_SECRET_KEY_CHANGE_THIS_IN_PROD"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(title="FinVista API")

# --- 1. SETUP SECURITY & DB ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

client = AsyncIOMotorClient(MONGO_URL)
db = client.finvista_db
users_collection = db.users

# --- CORS ---
origins = [
    "http://localhost:5173",                       
    "https://fin-vista-nine.vercel.app"            
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectionRequest(BaseModel):
    current_age: int
    retirement_age: int
    current_savings: float
    monthly_savings: float
    risk_tolerance: str

class InsightRequest(BaseModel):
    current_age: int
    retirement_age: int
    monthly_savings: float
    current_savings: float
    risk_tolerance: str
    market_trend: str

# --- HELPER FUNCTIONS ---
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
def get_password_hash(password): return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def fetch_live_market_data():
    tickers = {
        "NIFTY 50": "^NSEI",
        "SENSEX": "^BSESN",
        "USD/INR": "INR=X"
    }
    live_data = {}
    for name, symbol in tickers.items():
        try:
            ticker = yf.Ticker(symbol)
            price = ticker.fast_info.last_price
            prev_close = ticker.fast_info.previous_close
            change = price - prev_close
            pct_change = (change / prev_close) * 100
            is_up = change >= 0
            live_data[name] = {
                "price": f"{price:,.2f}",
                "pct": f"{pct_change:+.2f}%",
                "isUp": is_up
            }
        except Exception as e:
            print(f"Error fetching {name}: {e}")
            live_data[name] = {"price": "Error", "pct": "0.00%", "isUp": True}
    return live_data

# --- ROBUST AI CALL WITH FALLBACK ---
def call_gemini_api(prompt):
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not found")
        
    # List of models to try in order (Production v1 endpoint)
    # 1. Flash (Fastest)
    # 2. Pro (Most Stable/Available)
    models = ["gemini-1.5-flash", "gemini-pro"]
    
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    last_error = None

    for model in models:
        try:
            # Note: Using 'v1' endpoint now, not 'v1beta'
            url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={GEMINI_API_KEY}"
            
            print(f"Trying AI Model: {model}...")
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Model {model} failed with status {response.status_code}: {response.text}")
                last_error = response.text
                continue # Try next model

        except Exception as e:
            print(f"Exception calling {model}: {e}")
            last_error = str(e)
            continue

    raise Exception(f"All AI models failed. Last error: {last_error}")

# --- DEPENDENCIES ---
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await users_collection.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"]
    }

# --- ROUTES ---

@app.post("/api/register", response_model=Token)
async def register(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing: raise HTTPException(400, "Email already registered")
    
    hashed = get_password_hash(user.password)
    await users_collection.insert_one({"name": user.name, "email": user.email, "password": hashed})
    return {"access_token": create_access_token({"sub": user.email}), "token_type": "bearer"}

@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user['password']):
        raise HTTPException(400, "Invalid credentials")
    return {"access_token": create_access_token({"sub": user.email}), "token_type": "bearer"}

@app.get("/api/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.post("/api/project")
async def get_projection(req: ProjectionRequest, current_user: dict = Depends(get_current_user)):
    years = max(1, req.retirement_age - req.current_age)
    months = years * 12
    risk_map = {'aggressive': (0.14, 0.18), 'balanced': (0.11, 0.12), 'conservative': (0.08, 0.06)}
    mu, sigma = risk_map.get(req.risk_tolerance.lower(), (0.11, 0.12))
    
    returns = np.random.normal(mu/12, sigma/np.sqrt(12), (1000, months))
    values = np.zeros((1000, months + 1))
    values[:, 0] = req.current_savings
    
    total_invested = req.current_savings + (req.monthly_savings * months)

    for t in range(1, months + 1):
        values[:, t] = values[:, t-1] * (1 + returns[:, t-1]) + req.monthly_savings
        
    final_values = values[:, -1]
    success_count = np.count_nonzero(final_values > total_invested)
    success_probability = round((success_count / 1000) * 100, 1)

    labels = [str(2025 + i//12) for i in range(0, months+1, 12)]
    
    return {
        "labels": labels,
        "data_optimistic": [round(x/100000, 2) for x in np.percentile(values, 90, axis=0)[::12]],
        "data_median": [round(x/100000, 2) for x in np.median(values, axis=0)[::12]],
        "data_pessimistic": [round(x/100000, 2) for x in np.percentile(values, 10, axis=0)[::12]],
        "success_probability": success_probability
    }

@app.post("/api/analyze")
async def analyze_portfolio(req: InsightRequest, current_user: dict = Depends(get_current_user)):
    duration = req.retirement_age - req.current_age

    prompt = f"""
    Act as an Indian Financial Advisor.
    User Profile:
    - Age: {req.current_age}
    - Investment Horizon: {duration} Years (Retiring at {req.retirement_age})
    - Monthly SIP: ₹{req.monthly_savings}
    - Risk Tolerance: {req.risk_tolerance}
    - Market Trend: {req.market_trend}

    Based on this, return a strict JSON object (no markdown) with these keys:
    - risk_title (Max 5 words)
    - risk_desc (Max 20 words, specific to the duration/risk)
    - strategy_title (Max 5 words, e.g. "Mid-Cap Momentum", "Debt Heavy")
    - strategy_desc (Max 20 words, suggesting asset allocation)
    - macro_title (Max 5 words, e.g. "Bull Market Rally", "Inflationary Pressure")
    - macro_desc (Max 20 words, tailored to Indian context)
    """
    
    try:
        # CALL DIRECT API
        api_data = await asyncio.to_thread(call_gemini_api, prompt)
        
        # Parse Response safely
        try:
            raw_text = api_data['candidates'][0]['content']['parts'][0]['text']
            clean_json = raw_text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_json)
        except (KeyError, IndexError, json.JSONDecodeError):
            print("Failed to parse AI response structure.")
            return {"risk_title": "Parsing Error", "risk_desc": "AI response was invalid.", "strategy_title": "N/A", "strategy_desc": "N/A", "macro_title": "N/A", "macro_desc": "N/A"}

    except Exception as e:
        print(f"Final AI Error: {e}")
        return {"risk_title": "Service Unavailable", "risk_desc": "Please try again later.", "strategy_title": "Hold", "strategy_desc": "Keep investing", "macro_title": "N/A", "macro_desc": "N/A"}

# --- WEBSOCKET ---
@app.websocket("/ws/market")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await asyncio.to_thread(fetch_live_market_data)
            await websocket.send_json(data)
            await asyncio.sleep(3)
    except Exception as e:
        print(f"WebSocket disconnected: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)