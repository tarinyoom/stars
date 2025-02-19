import { SceneParameters, Renderer } from "./types";
import { mat4, vec3, quat } from "gl-matrix";

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

function getModelViewMatrix(cameraQuat: quat) {
    let viewMatrix = mat4.create(); // Identity matrix
    let rotationMatrix = mat4.create();
    
    // Convert quaternion to rotation matrix
    mat4.fromQuat(rotationMatrix, cameraQuat);

    // Define camera position (2.0 units along local Z)
    let cameraPosition = vec3.fromValues(0, 0, 2);
    
    // Rotate camera position using the rotation matrix
    vec3.transformMat4(cameraPosition, cameraPosition, rotationMatrix);
    
    // Compute view matrix using LookAt
    mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 0], [0, 1, 0]);

    return viewMatrix;
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

function updateModelViewMatrix(r: Renderer, q: quat) {
    r.gl.uniformMatrix4fv(r.modelViewMatrixLocation, false, getModelViewMatrix(q));
}

export function onPointerDown(scene: SceneParameters) {
    return (e: PointerEvent) => {
        scene.dragging = true;
        scene.draggingStartX = e.offsetX;
        scene.draggingStartY = e.offsetY;
    }
}

function yawQuaternion(yawDelta: number) {
    let qYaw = quat.create();
    quat.setAxisAngle(qYaw, [0, 1, 0], yawDelta); // Yaw rotation around Y-axis
    return qYaw;
}

function pitchQuaternion(pitchDelta: number) {
    let qPitch = quat.create();
    quat.setAxisAngle(qPitch, [1, 0, 0], pitchDelta); // Pitch rotation around X-axis
    return qPitch;
}

export function onPointerMove(r: Renderer, scene: SceneParameters) {
    updateModelViewMatrix(r, scene.cameraAngle);
    return (e: PointerEvent) => {
        e.preventDefault();
        if (scene.dragging) {
            const currentX = e.offsetX;
            const currentY = e.offsetY;
            const horizontalMotion = currentX - scene.draggingStartX;
            const verticalMotion = currentY - scene.draggingStartY;
            scene.draggingStartX = currentX;
            scene.draggingStartY = currentY;
            quat.multiply(scene.cameraAngle, scene.cameraAngle, yawQuaternion(horizontalMotion * 0.005));
            quat.multiply(scene.cameraAngle, scene.cameraAngle, pitchQuaternion(verticalMotion * 0.005));
            updateModelViewMatrix(r, scene.cameraAngle);
        }
    }
}

export function onPointerUp(scene: SceneParameters) {
    return () => {
        scene.dragging = false;
    };
}
