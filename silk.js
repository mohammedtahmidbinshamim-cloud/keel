import { Renderer, Program, Mesh, Color, Triangle } from './node_modules/ogl/src/index.js';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = vec3(position, 0.0);
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  // Optional aspect ratio correction, but leaving as original to match React version behavior
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  // Site's primary colors translated to normalized RGB
  vec3 colorLight = vec3(0.970, 0.954, 0.931); // Slightly dimmed from #faf6f0 to reduce overwhelming glow
  vec3 colorDark = vec3(0.938, 0.889, 0.830);  // Lightened #eadbcc slightly so the contrast (glow) is less harsh
  
  // We use smoothstep to balance the highlights and shadows gracefully
  // Increased the lower bound to 0.4 to broaden the midtones and reduce sharp, glowy highlights
  float blend = smoothstep(0.4, 1.0, pattern);
  vec3 col = mix(colorDark, colorLight, blend) - rnd / 15.0 * uNoiseIntensity;
  
  gl_FragColor = vec4(col, 1.0);
}
`;

export function initSilk(containerSelector) {
  console.log("Initializing Silk Background...");
  const ctn = document.querySelector(containerSelector);
  if (!ctn) {
    console.error("Silk container not found!");
    return;
  }

  // Warm ivory color to match var(--color-bg) #faf6f0 (not used directly in shader, but kept for object memory)
  const color = [0.98, 0.965, 0.941];
  const speed = 0.75; // Significantly reduced speed for a slower, calmer flow 
  const scale = 1.5; // Increased scale slightly so wrinkles look larger
  const noiseIntensity = 0.2; // Subtle grain, not too noisy
  const rotation = 0;

  const renderer = new Renderer({ alpha: true });
  const gl = renderer.gl;
  gl.clearColor(0.98, 0.965, 0.941, 1);

  let program;

  function resize() {
    renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
  }
  window.addEventListener('resize', resize, false);

  const geometry = new Triangle(gl);
  program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(...color) },
      uSpeed: { value: speed },
      uScale: { value: scale },
      uRotation: { value: rotation },
      uNoiseIntensity: { value: noiseIntensity }
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

  return () => {
    cancelAnimationFrame(animateId);
    window.removeEventListener('resize', resize);
    ctn.removeChild(gl.canvas);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
