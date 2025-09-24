/*-------------------------------------------------------------------------
06_FlipTriangle.js 
---------------------------------------------------------------------------*/
import { resizeAspectRatio, setupText } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

let shader, vao;

const HALF = 0.1;    
const STEP = 0.01;    // keydown 1회당 이동량
let offsetX = 0.0;
let offsetY = 0.0;

function initWebGL() {
  if (!gl) { console.error('WebGL2 not supported'); return false; }
  canvas.width = 600;
  canvas.height = 600;
  resizeAspectRatio(gl, canvas);           // 1:1 유지
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);       // 검정 배경
  return true;
}

async function initShader() {
  const vsrc = await readShaderFile('shVert.glsl');
  const fsrc = await readShaderFile('shFrag.glsl');
  shader = new Shader(gl, vsrc, fsrc);
}

function setupKeyboardEvents() {
  window.addEventListener('keydown', (e) => {
    if (!e.key.startsWith('Arrow')) return;
    e.preventDefault(); // 페이지 스크롤 방지

    if (e.key === 'ArrowUp')    offsetY += STEP;
    if (e.key === 'ArrowDown')  offsetY -= STEP;
    if (e.key === 'ArrowLeft')  offsetX -= STEP;
    if (e.key === 'ArrowRight') offsetX += STEP;

    const LIMIT = 1.0 - HALF;
    offsetX = Math.max(-LIMIT, Math.min(LIMIT, offsetX));
    offsetY = Math.max(-LIMIT, Math.min(LIMIT, offsetY));
  });
}

function setupBuffers() {
  const vertices = new Float32Array([
    -HALF, -HALF, 0.0,   // BL
     HALF, -HALF, 0.0,   // BR
     HALF,  HALF, 0.0,   // TR
    -HALF,  HALF, 0.0    // TL
  ]);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  shader.setAttribPointer('aPos', 3, gl.FLOAT, false, 0, 0);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  shader.use();
  shader.setVec2('uOffset', offsetX, offsetY);         // 이동량
  shader.setVec4('uColor', 1.0, 0.0, 0.0, 1.0);        // 빨강 고정

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  gl.bindVertexArray(null);

  requestAnimationFrame(render);
}

async function main() {
  if (!initWebGL()) return;
  await initShader();

  setupText(canvas, 'Use arrow keys to move the rectangle', 1); 

  setupBuffers();
  setupKeyboardEvents();
  render();
}
main();
