import { SceneParameters, Renderer } from "./types";
import { mat4, vec3 } from "gl-matrix";

function perspectiveMatrix(fov: number, aspect: number, near: number, far: number) {
    const f = 1.0 / Math.tan(fov / 2);
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0
    ]);
}

function updateProjectionMatrix(r: Renderer, width: number, height: number) {
    const aspect = width / height;
    const fov = Math.PI / 4; // 45 degrees
    const near = 0.1;
    const far = 100.0;

    const projectionMatrix = perspectiveMatrix(fov, aspect, near, far);

    r.gl.uniformMatrix4fv(r.projectionMatrixLocation, false, projectionMatrix);
}

export function onWindowResize(r: Renderer, canvas: HTMLCanvasElement, window: Window & typeof globalThis) {
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        r.gl.viewport(0, 0, canvas.width, canvas.height);
        updateProjectionMatrix(r, canvas.width, canvas.height);
    }
    resize();
    return resize;
}

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

export function onPointerDown(scene: SceneParameters) {
    return (e: PointerEvent) => {
        scene.dragging = true;
        scene.draggingStart = e.offsetX;
    }
}

export function onPointerMove(r: Renderer, scene: SceneParameters) {
    updateModelViewMatrix(r, 0.0);
    return (e: PointerEvent) => {
        e.preventDefault();
        if (scene.dragging) {
            const currentX = e.offsetX;
            const horizontalMotion = currentX - scene.draggingStart;
            updateModelViewMatrix(r, - horizontalMotion * 0.005);
        }
    }
}

export function onPointerUp(scene: SceneParameters) {
    return () => {
        scene.dragging = false;
    };
}
