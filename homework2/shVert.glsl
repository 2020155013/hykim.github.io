#version 300 es
layout (location = 0) in vec3 aPos;

uniform vec2 uOffset;   // 이동량

void main() {
    vec2 moved = aPos.xy + uOffset;
    gl_Position = vec4(moved, aPos.z, 1.0);
}
