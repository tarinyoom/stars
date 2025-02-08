// Get the WebGL context
const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl");

if (!gl) {
    console.error("WebGL not supported");
    throw new Error("WebGL not supported");
}

// Resize canvas to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

// Vertex Shader (Now 3D)
const vertexShaderSource = `
    precision mediump float;

    attribute vec3 position;
    attribute vec3 normal;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec3 lightDirection;
    uniform vec3 lightColor;
    uniform vec3 ambientColor;

    varying vec3 vColor; // Interpolated color passed to fragment shader

    void main() {
        vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
        vec3 transformedNormal = normalize(mat3(modelViewMatrix) * normal);
        float diffuse = max(dot(transformedNormal, normalize(lightDirection)), 0.0);

        // Compute vertex color based on lighting
        vColor = ambientColor + (lightColor * diffuse);

        gl_Position = projectionMatrix * worldPosition;
    }
`;

// Fragment Shader (Basic Lighting)
const fragmentShaderSource = `
    precision mediump float;

    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;


// Function to create a shader
function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        throw new Error("Shader compilation failed");
    }
    return shader;
}

// Create shaders
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// Create shader program
const program = gl.createProgram();
if (!program) throw new Error("Failed to create program");

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    throw new Error("Program linking failed");
}

gl.useProgram(program);

// Function to generate a sphere mesh
function createSphere(radius: number, latitudeBands: number, longitudeBands: number) {
    const positions = [];
    const normals = [];
    const indices = [];

    for (let lat = 0; lat <= latitudeBands; lat++) {
        const theta = (lat * Math.PI) / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= longitudeBands; lon++) {
            const phi = (lon * 2 * Math.PI) / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            positions.push(radius * x, radius * y, radius * z);
            normals.push(x, y, z); // Normals are just the unit sphere coordinates
        }
    }

    for (let lat = 0; lat < latitudeBands; lat++) {
        for (let lon = 0; lon < longitudeBands; lon++) {
            const first = lat * (longitudeBands + 1) + lon;
            const second = first + longitudeBands + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices),
    };
}

// Light properties
const lightDirection = new Float32Array([-0.5, -1.0, -0.5]); // Directional light from above-left
const lightColor = new Float32Array([1.0, 1.0, 1.0]); // White light
const ambientColor = new Float32Array([0.2, 0.2, 0.2]); // Soft ambient lighting

// Pass lighting data to shaders
const lightDirectionLocation = gl.getUniformLocation(program, "lightDirection");
const lightColorLocation = gl.getUniformLocation(program, "lightColor");
const ambientColorLocation = gl.getUniformLocation(program, "ambientColor");

gl.uniform3fv(lightDirectionLocation, lightDirection);
gl.uniform3fv(lightColorLocation, lightColor);
gl.uniform3fv(ambientColorLocation, ambientColor);

// Generate sphere data
const sphereData = createSphere(0.5, 30, 30);

// Create and bind a buffer for positions
const positionBuffer = gl.createBuffer();
if (!positionBuffer) throw new Error("Failed to create position buffer");

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, sphereData.positions, gl.STATIC_DRAW);

// Create and bind a buffer for normals
const normalBuffer = gl.createBuffer();
if (!normalBuffer) throw new Error("Failed to create normal buffer");

gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, sphereData.normals, gl.STATIC_DRAW);

// Create and bind an element array buffer for indices
const indexBuffer = gl.createBuffer();
if (!indexBuffer) throw new Error("Failed to create index buffer");

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphereData.indices, gl.STATIC_DRAW);

// Get attribute locations and enable them
const positionAttribute = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionAttribute);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);

const normalAttribute = gl.getAttribLocation(program, "normal");
gl.enableVertexAttribArray(normalAttribute);
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.vertexAttribPointer(normalAttribute, 3, gl.FLOAT, false, 0, 0);

// Define projection and model-view matrices
const projectionMatrix = new Float32Array([
    2.414, 0, 0, 0,
    0, 2.414, 0, 0,
    0, 0, -1.002, -1,
    0, 0, -0.2002, 0
]);

const modelViewMatrix = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, -2, 1
]);

const projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix");
const modelViewMatrixLocation = gl.getUniformLocation(program, "modelViewMatrix");

gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

// Render function
function render() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.drawElements(gl.TRIANGLES, sphereData.indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
}

render();
