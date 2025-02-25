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
    vNormal = normalize(normal);
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
uniform sampler2D uTexture;  // Texture sampler

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightDirection);
    vec3 viewDir = normalize(viewPosition - vPosition);

    // Sample the texture at the given UV coordinates
    vec3 textureColor = texture2D(uTexture, vTexCoord).rgb;

    // Ambient lighting (applies regardless of the texture)
    vec3 ambient = ambientColor;

    // Diffuse lighting (Lambertian reflection)
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = lightColor * diff;

    // Combine texture color with lighting
    vec3 finalColor = (ambient + diffuse) * textureColor;

    // Output the final color
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Vertex Shader
export const bgVertexShaderSource = `
precision highp float;

attribute vec3 a_position;
varying vec2 v_texCoord;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

void main() {
    mat4 view = mat4(mat3(u_viewMatrix)); // Remove translation component
    gl_Position = u_projectionMatrix * view * vec4(a_position, 1.0);

    // Cylindrical texture mapping
    float azimuth = atan(a_position.z, a_position.x);
    v_texCoord.x = azimuth / (2.0 * 3.14159265359) + 0.5; // Map azimuth to [0,1]
    v_texCoord.y = a_position.y * 0.5 + 0.5; // Map y from [-1,1] to [0,1]
}
`;

// Fragment Shader
export const bgFragmentShaderSource = `
precision highp float;

varying vec2 v_texCoord;

uniform sampler2D uTexture;  // Texture sampler

void main() {
    vec3 skyColor = texture2D(uTexture, v_texCoord).rgb;
    gl_FragColor = vec4(skyColor, 1.0);
}
`;
