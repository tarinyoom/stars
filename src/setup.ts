import { sphereVertexShaderSource, sphereFragmentShaderSource, bgVertexShaderSource, bgFragmentShaderSource } from "./shaders";
import { Mesh, Renderer } from "./types";

// Function to create a shader
function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
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

function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) throw new Error("Failed to initialize shaders");
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        throw new Error("Failed to create program.");
    }
    
    return program;
}

export function makeRenderer(gl: WebGL2RenderingContext): Renderer {

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, sphereVertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, sphereFragmentShaderSource);

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
        bgProgram: createProgram(gl, bgVertexShaderSource, bgFragmentShaderSource),
        projectionMatrixLocation: projectionMatrixLocation,
        modelViewMatrixLocation: modelViewMatrixLocation
    };
}

export function registerBackground(r: Renderer): WebGLVertexArrayObject {

    let gl = r.gl;

    const fullscreenTriangleVertices = new Float32Array([
        -1.0, -1.0,  // Bottom-left
        3.0, -1.0,   // Bottom-right (extends beyond screen)
        -1.0, 3.0,   // Top-left (extends beyond screen)
    ]);
    
    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, fullscreenTriangleVertices, gl.STATIC_DRAW);
    
    // Enable position attribute (only 2D positions, no normals or texCoords needed)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    
    gl.bindVertexArray(null);
    
    return vao;
}

export function registerMesh(r: Renderer, m: Mesh): WebGLVertexArrayObject {

    let gl = r.gl;

    // Step 1: Create and bind the VAO
    const vao = gl.createVertexArray();
    if (!vao) throw new Error("Failed to create VAO");
    gl.bindVertexArray(vao);

    // Step 2: Create buffers
    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) throw new Error("Failed to create position buffer");

    const normalBuffer = gl.createBuffer();
    if (!normalBuffer) throw new Error("Failed to create normal buffer");

    const texCoordBuffer = gl.createBuffer();
    if (!texCoordBuffer) throw new Error("Failed to create texture buffer");

    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) throw new Error("Failed to create index buffer");

    // Step 3: Bind buffers and upload data
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, m.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, m.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, m.texCoords, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.indices, gl.STATIC_DRAW);

    // Step 4: Get attribute locations and enable them
    const positionAttribute = gl.getAttribLocation(r.program, "position");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);

    const normalAttribute = gl.getAttribLocation(r.program, "normal");
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.enableVertexAttribArray(normalAttribute);
    gl.vertexAttribPointer(normalAttribute, 3, gl.FLOAT, false, 0, 0);

    const texCoordAttribute = gl.getAttribLocation(r.program, "texCoord");
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.enableVertexAttribArray(texCoordAttribute);
    gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    // Step 5: Unbind VAO to prevent unintended modifications
    gl.bindVertexArray(null);

    return vao;
}
