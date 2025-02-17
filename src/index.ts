import { createSphere } from "./createSphere";
import { onMouseDown, onMouseMove, onMouseUp, onWindowResize } from "./controls";
import { SceneParameters, Mesh } from "./types";
import { makeRenderer, registerMesh } from "./setup";

// Get the WebGL context
const canvas = document.getElementById("glcanvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl");

if (!gl) {
    console.error("WebGL not supported");
    throw new Error("WebGL not supported");
}

let r = makeRenderer(gl);
let scene: SceneParameters = {
    dragging: false,
    draggingStart: 0.0,
    viewAngle: 0.0
};
const sphere = createSphere(0.5, 30, 30);

// Resize canvas to fill the screen
gl.viewport(0, 0, canvas.width, canvas.height);

window.addEventListener("resize", onWindowResize(r, canvas, window));
canvas.addEventListener('mousedown', onMouseDown(scene));
canvas.addEventListener('mousemove', onMouseMove(r, scene));
canvas.addEventListener('mouseup', onMouseUp(scene));
canvas.addEventListener('mouseleave', onMouseUp(scene));

// Higher-order function to generate a render function with specific WebGL context and parameters
export function createRenderFunction(gl: WebGLRenderingContext, sphere: Mesh) {

    // Return the render function
    return function render() {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
    
        gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);
    
        requestAnimationFrame(render);
    };    
}

registerMesh(r, sphere);
createRenderFunction(r.gl, sphere)();
