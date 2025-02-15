import { SceneParameters, Renderer } from "./types";
import { mat4, vec3 } from "gl-matrix";

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

function updateModelViewMatrix(r: Renderer, pol: number) {
    r.gl.uniformMatrix4fv(r.modelViewMatrixLocation, false, makeModelViewMatrix(pol));
}

export function onMouseDown(scene: SceneParameters) {
    return (e: MouseEvent) => {
        scene.dragging = true;
        scene.draggingStart = e.offsetX;
    }
}

export function onMouseMove(r: Renderer, scene: SceneParameters) {
    updateModelViewMatrix(r, 0.0);
    return (e: MouseEvent) => {
        if (scene.dragging) {
            const currentX = e.offsetX;
            const horizontalMotion = currentX - scene.draggingStart;
            updateModelViewMatrix(r, - horizontalMotion * 0.005);
        }
    }
}

export function onMouseUp(scene: SceneParameters) {
    return () => {
        scene.dragging = false;
    };
}
