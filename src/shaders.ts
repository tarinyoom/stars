export const vertexShaderSource = `
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

export const fragmentShaderSource = `
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
