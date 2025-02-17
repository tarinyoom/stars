import { vertexShaderSource, fragmentShaderSource } from "./shaders";
import { Mesh, Renderer } from "./types";

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

export function makeRenderer(gl: WebGLRenderingContext): Renderer {

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

    const projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix");
    if (!projectionMatrixLocation) throw new Error("Failed to get projection matrix location");

    const modelViewMatrixLocation = gl.getUniformLocation(program, "modelViewMatrix");
    if (!modelViewMatrixLocation) throw new Error("Failed to get model view matrix location");

    return {
        gl: gl,
        program: program,
        projectionMatrixLocation: projectionMatrixLocation,
        modelViewMatrixLocation: modelViewMatrixLocation
    };
}

export function registerMesh(r: Renderer, m: Mesh) {

    let gl = r.gl;

    // Create and bind a buffer for positions
    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) throw new Error("Failed to create position buffer");

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, m.positions, gl.STATIC_DRAW);

    // Create and bind a buffer for normals
    const normalBuffer = gl.createBuffer();
    if (!normalBuffer) throw new Error("Failed to create normal buffer");

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, m.normals, gl.STATIC_DRAW);

    // Create and bind an element array buffer for indices
    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) throw new Error("Failed to create index buffer");

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.indices, gl.STATIC_DRAW);

    // Get attribute locations and enable them
    const positionAttribute = gl.getAttribLocation(r.program, "position");
    gl.enableVertexAttribArray(positionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);

    const normalAttribute = gl.getAttribLocation(r.program, "normal");
    gl.enableVertexAttribArray(normalAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalAttribute, 3, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    if (!texCoordBuffer) throw new Error("Failed to create texture buffer");

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, m.texCoords, gl.STATIC_DRAW);

    const texCoordAttribute = gl.getAttribLocation(r.program, "texCoord");
    gl.enableVertexAttribArray(texCoordAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);    
}
