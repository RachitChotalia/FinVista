import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Program, Mesh, Plane } from 'ogl';

const BackgroundCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
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
            float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }
            void main() {
                vec2 p = vUv - 0.5 + uMouse * 0.05;
                float t = uTime * 0.05;
                
                // sharper curves for a more "tech" feel
                float r_disp = sin(t + length(p) * 8.0) * 0.2; 
                float g_disp = cos(t + length(p) * 9.0) * 0.2;
                
                vec3 color = vec3(
                    smoothstep(0.2, 0.8, sin(p.x * 4.0 + t + r_disp)),
                    0.0, // Removing green for a stronger Red/Black vibe
                    smoothstep(0.2, 0.8, sin(p.y * 4.0 - t + g_disp)) * 0.5
                );
                
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

    return (
        <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-40">
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    );
};

export default BackgroundCanvas;