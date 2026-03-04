import { Renderer, Program, Mesh, Color, Triangle } from './node_modules/ogl/src/index.js';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  
  // Custom theme adaptation!
  vec3 bgCol = vec3(0.165, 0.110, 0.078); // #2a1c14 matches the premium dark cocoa theme!
  col = mix(bgCol, col, 0.65); // 65% gold iridescence layered cleanly over the dark brown
  
  gl_FragColor = vec4(col, 1.0);
}
`;

export function initIridescence(containerSelector) {
    console.log("Initializing Iridescence Background...");
    const ctn = document.querySelector(containerSelector);
    if (!ctn) {
        console.error("Iridescence container not found!");
        return;
    }

    const color = [0.717, 0.549, 0.262]; // gold color matching #b78c43
    const speed = 1.0;
    const amplitude = 0.1;
    const mouseReact = true;

    const mousePos = { x: 0.5, y: 0.5 };

    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    // Dark cocoa color matching #2a1c14
    gl.clearColor(0.165, 0.110, 0.078, 1);

    let program;

    function resize() {
        const scale = 1;
        renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
        if (program) {
            program.uniforms.uResolution.value = new Color(
                gl.canvas.width,
                gl.canvas.height,
                gl.canvas.width / gl.canvas.height
            );
        }
    }
    window.addEventListener('resize', resize, false);

    const geometry = new Triangle(gl);
    program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new Color(...color) },
            uResolution: {
                value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
            },
            uMouse: { value: new Float32Array([mousePos.x, mousePos.y]) },
            uAmplitude: { value: amplitude },
            uSpeed: { value: speed }
        }
    });

    const mesh = new Mesh(gl, { geometry, program });
    let animateId;

    function update(t) {
        animateId = requestAnimationFrame(update);
        program.uniforms.uTime.value = t * 0.001;
        renderer.render({ scene: mesh });
    }

    resize();
    animateId = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    function handleMouseMove(e) {
        const rect = ctn.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height;
        mousePos.x = x;
        mousePos.y = y;
        program.uniforms.uMouse.value[0] = x;
        program.uniforms.uMouse.value[1] = y;
    }

    if (mouseReact) {
        window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
        cancelAnimationFrame(animateId);
        window.removeEventListener('resize', resize);
        if (mouseReact) {
            window.removeEventListener('mousemove', handleMouseMove);
        }
        ctn.removeChild(gl.canvas);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
}
