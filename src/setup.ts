import { sphereVertexShaderSource, sphereFragmentShaderSource, bgVertexShaderSource, bgFragmentShaderSource } from "./shaders";
import { Mesh, Renderer } from "./types";
import { mat4 } from "gl-matrix";

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

export function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
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

    const sphereProgram = createProgram(gl, sphereVertexShaderSource, sphereFragmentShaderSource);
    const skyboxProgram = createProgram(gl, bgVertexShaderSource, bgFragmentShaderSource);

    gl.useProgram(sphereProgram);

    // Light properties
    const lightDirection = new Float32Array([0.0, 1.0, 0.0]); // Directional light
    const lightColor = new Float32Array([1.0, 1.0, 1.0]); // White light
    const ambientColor = new Float32Array([0.2, 0.2, 0.2]); // Soft ambient lighting
    const viewPosition = new Float32Array([0.0, 0.0, 3.0]); // Camera position

    // Pass lighting data to shaders
    const lightDirectionLocation = gl.getUniformLocation(sphereProgram, "lightDirection");
    const lightColorLocation = gl.getUniformLocation(sphereProgram, "lightColor");
    const ambientColorLocation = gl.getUniformLocation(sphereProgram, "ambientColor");
    const viewPositionLocation = gl.getUniformLocation(sphereProgram, "viewPosition");

    gl.uniform3fv(lightDirectionLocation, lightDirection);
    gl.uniform3fv(lightColorLocation, lightColor);
    gl.uniform3fv(ambientColorLocation, ambientColor);
    gl.uniform3fv(viewPositionLocation, viewPosition);

    const projectionMatrixLocation = gl.getUniformLocation(sphereProgram, "projectionMatrix");
    if (!projectionMatrixLocation) throw new Error("Failed to get projection matrix location");

    const modelViewMatrixLocation = gl.getUniformLocation(sphereProgram, "modelViewMatrix");
    if (!modelViewMatrixLocation) throw new Error("Failed to get model view matrix location");

    return {
        gl: gl,
        sphereProgram: sphereProgram,
        bgProgram: skyboxProgram,
        projectionMatrix: mat4.create(),
        modelViewMatrix: mat4.create(),
        projectionMatrixLocation: projectionMatrixLocation,
        modelViewMatrixLocation: modelViewMatrixLocation
    };
}

export function registerSkybox(r: Renderer) {
    const gl = r.gl;
    
    const segments = 64; // Longitude (around Y-axis)
    const rings = 32; // Latitude (from pole to pole)
    const radius = 1.0;

    const positions: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    // Generate vertices (excluding poles for now)
    for (let lat = 0; lat <= rings; lat++) {
        const v = lat / rings;
        const theta = v * Math.PI; // Latitude angle from 0 (north pole) to π (south pole)

        for (let lon = 0; lon <= segments; lon++) {
            const u = lon / segments;
            const phi = u * 2.0 * Math.PI; // Longitude angle around Y-axis

            const x = Math.sin(theta) * Math.cos(phi) * radius;
            const y = Math.cos(theta) * radius; // Y-axis is up
            const z = Math.sin(theta) * Math.sin(phi) * radius;

            positions.push(x, y, z);
            texCoords.push(u, v);
        }
    }

    // Generate indices
    for (let lat = 0; lat < rings; lat++) {
        for (let lon = 0; lon < segments; lon++) {
            const first = lat * (segments + 1) + lon;
            const second = first + segments + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    // Convert to Typed Arrays
    const positionArray = new Float32Array(positions);
    const texCoordArray = new Float32Array(texCoords);
    const indexArray = new Uint16Array(indices);

    // Create VAO
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Position Buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.STATIC_DRAW);
    const positionLocation = 0;
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    // Texture Coordinate Buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordArray, gl.STATIC_DRAW);
    const texCoordLocation = 1;
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Index Buffer
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);

    // Unbind VAO
    gl.bindVertexArray(null);

    return { vao, indexBuffer, indexCount: indices.length };
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
    const positionAttribute = gl.getAttribLocation(r.sphereProgram, "position");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);

    const normalAttribute = gl.getAttribLocation(r.sphereProgram, "normal");
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.enableVertexAttribArray(normalAttribute);
    gl.vertexAttribPointer(normalAttribute, 3, gl.FLOAT, false, 0, 0);

    const texCoordAttribute = gl.getAttribLocation(r.sphereProgram, "texCoord");
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.enableVertexAttribArray(texCoordAttribute);
    gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    // Step 5: Unbind VAO to prevent unintended modifications
    gl.bindVertexArray(null);

    return vao;
}
