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
    attribute vec3 position;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader (Basic Lighting)
const fragmentShaderSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
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

    return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
}

// Generate sphere data
const sphereData = createSphere(0.5, 30, 30);

// Create and bind a buffer for positions
const positionBuffer = gl.createBuffer();
if (!positionBuffer) throw new Error("Failed to create buffer");

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, sphereData.positions, gl.STATIC_DRAW);

// Create and bind an element array buffer for indices
const indexBuffer = gl.createBuffer();
if (!indexBuffer) throw new Error("Failed to create index buffer");

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphereData.indices, gl.STATIC_DRAW);

// Get attribute location, enable it, and set the pointer
const positionAttribute = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionAttribute);
gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);

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
