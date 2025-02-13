import { vertexShaderSource, fragmentShaderSource } from "./shaders";
import { createSphere } from "./createSphere";
import { mat4, vec3 } from "gl-matrix";
import { createRenderFunction } from "./render";

// Get the WebGL context
const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl");

if (!gl) {
    console.error("WebGL not supported");
    throw new Error("WebGL not supported");
}

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Resize canvas to fill the screen
gl.viewport(0, 0, canvas.width, canvas.height);

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

// Light properties
const lightDirection = new Float32Array([-0.5, -1.0, -0.5]); // Directional light
const lightColor = new Float32Array([1.0, 1.0, 1.0]); // White light
const ambientColor = new Float32Array([0.2, 0.2, 0.2]); // Soft ambient lighting
const viewPosition = new Float32Array([0.0, 0.0, 3.0]); // Camera position

// Pass lighting data to shaders
const lightDirectionLocation = gl.getUniformLocation(program, "lightDirection");
const lightColorLocation = gl.getUniformLocation(program, "lightColor");
const ambientColorLocation = gl.getUniformLocation(program, "ambientColor");
const viewPositionLocation = gl.getUniformLocation(program, "viewPosition");

gl.uniform3fv(lightDirectionLocation, lightDirection);
gl.uniform3fv(lightColorLocation, lightColor);
gl.uniform3fv(ambientColorLocation, ambientColor);
gl.uniform3fv(viewPositionLocation, viewPosition);

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

const texCoordBuffer = gl.createBuffer();
if (!texCoordBuffer) throw new Error("Failed to create texture buffer");

gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, sphereData.texCoords, gl.STATIC_DRAW);

const texCoordAttribute = gl.getAttribLocation(program, "texCoord");
gl.enableVertexAttribArray(texCoordAttribute);
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);

// Define projection and model-view matrices
const projectionMatrix = new Float32Array([
    2.414, 0, 0, 0,
    0, 2.414, 0, 0,
    0, 0, -1.002, -1,
    0, 0, -0.2002, 0
]);

function makeModelViewMatrix(polar: number): mat4 {
    // Calculate the camera's position based on the polar angle
    const radius = 2; // This is the distance from the origin
    const cameraX = radius * Math.sin(polar);
    const cameraZ = radius * Math.cos(polar);
    const cameraY = 0; // Assuming you want the camera level with the origin's Y axis

    // Camera position as a ReadonlyVec3
    const eye = vec3.fromValues(cameraX, cameraY, cameraZ);

    // Target is the origin
    const center = vec3.fromValues(0, 0, 0);

    // Up vector is typically along the Y-axis
    const up = vec3.fromValues(0, 1, 0);

    // Create the view matrix using gl-matrix's lookAt function
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, eye, center, up);

    return viewMatrix;
}


const projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix");
const modelViewMatrixLocation = gl.getUniformLocation(program, "modelViewMatrix");

gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
gl.uniformMatrix4fv(modelViewMatrixLocation, false, makeModelViewMatrix(0.0));

function perspectiveMatrix(fov: number, aspect: number, near: number, far: number) {
    const f = 1.0 / Math.tan(fov / 2);
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0
    ]);
}

function updateProjectionMatrix(width: number, height: number) {
    const aspect = width / height;
    const fov = Math.PI / 4; // 45 degrees
    const near = 0.1;
    const far = 100.0;

    const projectionMatrix = perspectiveMatrix(fov, aspect, near, far);

    const projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
}

canvas.addEventListener("resize", () => {
    // Resize the canvas to match window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    updateProjectionMatrix(canvas.width, canvas.height); // Recalculate projection matrix
});

// Initialize projection matrix
updateProjectionMatrix(canvas.width, canvas.height);

createRenderFunction(gl, sphereData)();
