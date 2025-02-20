import { createSphere } from "./createSphere";
import { onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchUp, onWindowResize } from "./controls";
import { SceneParameters } from "./types";
import { makeRenderer, registerMesh } from "./setup";
import { quat } from "gl-matrix";

// Get the WebGL context
const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2");

if (!gl) {
    console.error("WebGL 2.0 not supported");
    throw new Error("WebGL 2.0 not supported");
}

let r = makeRenderer(gl);
let scene: SceneParameters = {
    dragging: false,
    draggingStartX: 0.0,
    draggingStartY: 0.0,
    azimuthalViewAngle: 0.0,
    polarViewAngle: 1.0,
    cameraAngle: quat.create()
};

// Resize canvas to fill the screen
gl.viewport(0, 0, canvas.width, canvas.height);

window.addEventListener("resize", onWindowResize(r, canvas, window));

canvas.addEventListener('mousedown', onMouseDown(scene), { passive: false });
canvas.addEventListener('mousemove', onMouseMove(r, scene), { passive: false });
canvas.addEventListener('mouseup', onMouseUp(scene), { passive: false });
canvas.addEventListener('mouseleave', onMouseUp(scene), { passive: false });

canvas.addEventListener('touchstart', onTouchStart(scene), { passive: false });
canvas.addEventListener('touchmove', onTouchMove(r, scene), { passive: false });
canvas.addEventListener('touchup', onTouchUp(scene), { passive: false });
canvas.addEventListener('touchleave', onTouchUp(scene), { passive: false });

// Higher-order function to generate a render function with specific WebGL context and parameters
export function createRenderFunction(gl: WebGL2RenderingContext) {

    const sphere = createSphere(0.5, 30, 30, 0);
    let sphereVAO = registerMesh(r, sphere);

    const sphere2 = createSphere(0.1, 10, 10, 1.0);
    let sphereVAO2 = registerMesh(r, sphere2);

    // Return the render function
    return function render() {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.bindVertexArray(sphereVAO);
        gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.bindVertexArray(sphereVAO2);
        gl.drawElements(gl.TRIANGLES, sphere2.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.bindVertexArray(null);
    
        requestAnimationFrame(render);
    };    
}

createRenderFunction(r.gl)();
