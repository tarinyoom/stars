/**
 * Geometry and texture mapping for a 2D surface mesh.
 */
export type Mesh = {
    positions: Float32Array;
    normals: Float32Array;
    texCoords: Float32Array;
    indices: Uint16Array;
};

/**
 * Modifiable state of the scene.
 */
export type SceneParameters = {
    dragging: boolean;
    draggingStartX: number;
    draggingStartY: number;
    polarViewAngle: number;
    azimuthalViewAngle: number;
};

/**
 * Renderer with some precomputed values accessed from rendering context.
 */
export type Renderer = {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    projectionMatrixLocation: WebGLUniformLocation;
    modelViewMatrixLocation: WebGLUniformLocation;
};
