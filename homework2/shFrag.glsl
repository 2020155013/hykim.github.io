#version 300 es
precision mediump float;

out vec4 FragColor;
uniform vec4 uColor;  // JS에서 [1,0,0,1] 전달

void main() {
    FragColor = uColor;
}
