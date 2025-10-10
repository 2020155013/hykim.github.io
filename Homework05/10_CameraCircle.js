/*-------------------------------------------------------------------------
Homework 5

1) 처음 실행했을 때 canvas의 크기는 700 x 700 이어야 함
2) 사각뿔 bottom face의 size는 dx = dz = 1 이며, bottom rectangle의 중심부터 꼭짓점까지의 높이도 1임
3) 사각뿔 bottom face는 xz plane위에 있으며 (y =0), 그 center는 (0,0) 임
4) Camera position의 x와 z는 radius = 3인 circular path를 돌며, y는 0부터 10까지를 계속 반복함 -> Math.sin() 사용
5) Camera의 circular movement (x and z) 의 속도는 90 deg/sec이며, y 방향의 속도는 45 deg/sec임
6) 사각뿔은 제자리에 고정되어 있으며, rotation 하지 않음 
7) 사각뿔을 위해 squarePyramid.js 라는 library file을 작성하도록 하며, ../util 이 아니라 반드시 Homework05 folder 안에 두도록 합니다. 
---------------------------------------------------------------------------*/

import { resizeAspectRatio, Axes } from './util.js';
import { Shader, readShaderFile } from './shader.js';
import { SquarePyramid } from './squarePyramid.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let startTime;
let lastFrameTime;

let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();

const ORBIT_RADIUS = 3.0;          // 4) radius = 3인 circular path
const ORBIT_SPEED_DEG = 90.0;      // 5) x,z 원운동 속도 : 90 deg/sec
const Y_SPEED_DEG = 45.0;          // 5) y 속도 :  45 deg/sec

const pyramid = new SquarePyramid(gl); 
const axes = new Axes(gl, 1.8);

document.addEventListener('DOMContentLoaded', () => {
  if (isInitialized) {
      console.log("Already initialized");
      return;
  }

  main().then(success => {
      if (!success) {
          console.log('program terminated');
          return;
      }
      isInitialized = true;
  }).catch(error => {
      console.error('program terminated with error:', error);
  });
});

function initWebGL() {
  if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
    return false;
  }
  // 1) 초기 캔버스 700x700
  canvas.width = 700;
  canvas.height = 700;

  resizeAspectRatio(gl, canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.7, 0.8, 0.9, 1.0);


  return true;
}

async function initShader() {
  const vertexShaderSource = await readShaderFile('shVert.glsl');
  const fragmentShaderSource = await readShaderFile('shFrag.glsl');
  shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render() {
  const currentTime = Date.now();

  
  // deltaTime: elapsed time from the last frame
  const deltaTime = (currentTime - lastFrameTime) / 1000.0; // convert to second

  // elapsed time from the start time
  const elapsedTime = (currentTime - startTime) / 1000.0; // convert to second

  lastFrameTime = currentTime;


  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  // 6) 사각뿔 회전 금지 → model = I
  mat4.identity(modelMatrix);

  // 4)~5) 카메라 궤적
  const theta = glMatrix.toRadian(ORBIT_SPEED_DEG * elapsedTime); // 원운동 각도
  const phi   = glMatrix.toRadian(Y_SPEED_DEG * elapsedTime);     // y진동 각도

  const camX = ORBIT_RADIUS * Math.sin(theta);
  const camZ = ORBIT_RADIUS * Math.cos(theta);
  // y: 0..10 반복 → 5*(sin + 1)
  const camY = 5.0 * (Math.sin(phi) + 1.0); // [0,10] 범위 

  mat4.lookAt(
    viewMatrix,
    vec3.fromValues(camX, camY, camZ),
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(0, 1, 0)
  );

  // draw pyramid
  shader.use();
  shader.setMat4('u_model', modelMatrix);
  shader.setMat4('u_view', viewMatrix);
  shader.setMat4('u_projection', projMatrix);
  pyramid.draw(shader);

  // draw axes
  axes.draw(viewMatrix, projMatrix);

  requestAnimationFrame(render);
}

async function main() {
  try {
    if (!initWebGL()) throw new Error('WebGL initialization failed');
    await initShader();

    // 투영행렬
    mat4.perspective(
      projMatrix,
      glMatrix.toRadian(60),
      canvas.width / canvas.height,
      0.1,
      100.0
    );

    startTime = lastFrameTime = Date.now();
    requestAnimationFrame(render);
    return true;
  } catch (e) {
    console.error('Failed to initialize program:', e);
    alert('Failed to initialize program');
    return false;
  }
}
