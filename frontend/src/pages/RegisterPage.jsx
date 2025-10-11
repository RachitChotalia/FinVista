import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'ogl';

// The PrismCanvas component will provide the animated background
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


const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder for registration logic
        console.log('Form submitted', formData);
    };

    return (
        <div className="min-h-screen w-full bg-black font-sans text-white overflow-hidden isolate flex items-center justify-center p-4">
            <PrismCanvas />
            <div className="relative z-10 w-full max-w-md">
                <div className="p-8 bg-black/30 rounded-2xl shadow-lg border border-white/10 backdrop-blur-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold">Create Account</h1>
                        <p className="text-gray-400 mt-2">Join FinVista and plan your future.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-gray-900/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-gray-900/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-gray-900/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full mt-2 px-8 py-3 font-bold text-white bg-gradient-to-r from-red-600 to-red-800 rounded-md hover:opacity-90 transition-opacity"
                        >
                            Sign Up
                        </button>
                    </form>
                    <p className="text-center text-gray-400 mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-red-500 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

<p className="text-center text-gray-400 mt-8">
    Already have an account?{' '}
    <Link to="/login" className="font-medium text-red-500 hover:underline">
        Login
    </Link>
</p>

export default RegisterPage;

