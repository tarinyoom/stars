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

function makeModelViewMatrix(polar: number, azimuthal: number): mat4 {
    // Calculate the camera's position based on the polar angle
    const radius = 2; // This is the distance from the origin
    const cameraX = radius * Math.sin(polar) * Math.sin(azimuthal);
    const cameraZ = radius * Math.sin(polar) * Math.cos(azimuthal);
    const cameraY = radius * Math.cos(polar);

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

function updateModelViewMatrix(r: Renderer, pol: number, az: number) {
    r.gl.uniformMatrix4fv(r.modelViewMatrixLocation, false, makeModelViewMatrix(pol, az));
}

export function onPointerDown(scene: SceneParameters) {
    return (e: PointerEvent) => {
        scene.dragging = true;
        scene.draggingStartX = e.offsetX;
        scene.draggingStartY = e.offsetY;
    }
}

export function onPointerMove(r: Renderer, scene: SceneParameters) {
    updateModelViewMatrix(r, scene.polarViewAngle, scene.azimuthalViewAngle);
    return (e: PointerEvent) => {
        e.preventDefault();
        if (scene.dragging) {
            const currentX = e.offsetX;
            const currentY = e.offsetY;
            const horizontalMotion = currentX - scene.draggingStartX;
            const verticalMotion = currentY - scene.draggingStartY;
            scene.draggingStartX = currentX;
            scene.draggingStartY = currentY;
            scene.azimuthalViewAngle -= horizontalMotion * 0.005;
            scene.polarViewAngle -= verticalMotion * 0.005;
            updateModelViewMatrix(r, scene.polarViewAngle, scene.azimuthalViewAngle);
        }
    }
}

export function onPointerUp(scene: SceneParameters) {
    return () => {
        scene.dragging = false;
    };
}
