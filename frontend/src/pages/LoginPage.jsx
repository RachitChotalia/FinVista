import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'ogl';


const PrismCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const renderer = new Renderer({ canvas, dpr: 2, alpha: true, antialias: true });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);

        const camera = new Camera(gl, { fov: 15 });
        camera.position.z = 15;

        const resize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        };
        window.addEventListener('resize', resize, false);
        resize();

        const scene = new Transform();
        const geometry = new Plane(gl, { width: 20, height: 12 });

        const mouse = { x: 0, y: 0 };
        const handleMouseMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const vertex = `
            attribute vec2 uv;
            attribute vec3 position;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragment = `
            precision highp float;
            uniform float uTime;
            uniform vec2 uMouse;
            varying vec2 vUv;
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            void main() {
                vec2 p = vUv - 0.5;
                p += uMouse * 0.1;
                float t = uTime * 0.1;
                float r_disp = sin(t * 0.7 + random(p) * 2.0) * 0.1;
                float g_disp = cos(t * 0.5 + random(p + 0.1) * 2.0) * 0.15;
                float b_disp = sin(t * 0.6 + random(p + 0.2) * 2.0) * 0.2;
                vec3 color = vec3(
                    sin(length(p + r_disp) * 10.0 - t * 2.5),
                    cos(length(p + g_disp) * 12.0 - t * 2.0),
                    sin(length(p + b_disp) * 14.0 - t * 3.0)
                );
                color = normalize(abs(color));
                float vignette = 1.0 - length(vUv - 0.5) * 0.8;
                color *= vignette;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: { uTime: { value: 0 }, uMouse: { value: [0, 0] } },
        });

        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        let animationFrameId;
        const update = (t) => {
            program.uniforms.uTime.value = t * 0.001;
            program.uniforms.uMouse.value = [mouse.x, mouse.y];
            renderer.render({ scene, camera });
            animationFrameId = requestAnimationFrame(update);
        };
        animationFrameId = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 opacity-25" />;
};


const LoginPage = () => {
    
    const handleLogin = (e) => {
        e.preventDefault();
        // Backend login logic will go here
        console.log("Login form submitted");
    };

    return (
        <div className="min-h-screen w-full bg-black font-sans text-white overflow-hidden isolate">
            <PrismCanvas />
            
            <header className="absolute top-0 left-0 w-full z-20 p-4 sm:p-6 lg:p-8">
                 <Link to="/" className="text-2xl font-bold hover:text-red-400 transition-colors">FinVista</Link>
            </header>

            <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                {/* Glassmorphism Login Form */}
                <div className="w-full max-w-md p-8 space-y-6 bg-black/30 rounded-2xl shadow-lg border border-white/10 backdrop-blur-lg">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">Welcome Back</h2>
                        <p className="mt-2 text-sm text-gray-400">Log in to continue your financial journey.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 focus:border-red-500 sm:text-sm transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password"className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-red-500 hover:text-red-400 transition-colors">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 focus:border-red-500 sm:text-sm transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 font-bold text-white bg-gradient-to-r from-red-600 to-red-800 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500"
                            >
                                Log In
                            </button>
                        </div>
                    </form>
                    
                    <p className="text-sm text-center text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-red-500 hover:text-red-400 transition-colors">
                            Sign up today
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;