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
    draggingStart: number;
    viewAngle: number;
};
