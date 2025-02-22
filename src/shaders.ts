export const sphereVertexShaderSource = `
precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

void main() {
    vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = worldPosition.xyz;
    vNormal = normalize(mat3(modelViewMatrix) * normal);
    vTexCoord = texCoord; // Pass UV coordinates to fragment shader

    gl_Position = projectionMatrix * worldPosition;
}
`;

export const sphereFragmentShaderSource = `
precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform vec3 viewPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightDirection);
    vec3 viewDir = normalize(viewPosition - vPosition);

    // Ambient lighting
    vec3 ambient = ambientColor;

    // Diffuse lighting (Lambertian reflection)
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = lightColor * diff;

    // Specular lighting (Blinn-Phong reflection)
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
    vec3 specular = lightColor * spec;

    // Procedural checkerboard texture
    float scale = 10.0; // Number of squares in checkerboard pattern
    float check = mod(floor(vTexCoord.x * scale) + floor(vTexCoord.y * scale), 2.0);
    vec3 checkerColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), check);

    // Combine texture with lighting
    vec3 finalColor = (ambient + diffuse + specular) * checkerColor;
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const bgVertexShaderSource = `#version 300 es
precision highp float;

in vec3 a_position;
out vec3 v_texCoord;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

void main() {
    v_texCoord = a_position;
    mat4 view = mat4(mat3(u_viewMatrix)); // Remove translation component
    gl_Position = u_projectionMatrix * view * vec4(a_position, 1.0);
}
`;

export const bgFragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_texCoord;
out vec4 fragColor;

void main() {
    vec3 dir = normalize(v_texCoord);
    float gradient = smoothstep(-1.0, 1.0, dir.y); // Simple sky gradient

    vec3 skyColor = mix(vec3(0.1, 0.2, 0.5), vec3(0.6, 0.8, 1.0), gradient);
    fragColor = vec4(skyColor, 1.0);
}
`;
