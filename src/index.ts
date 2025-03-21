import { createSphere } from "./createSphere";
import { onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchUp, onWindowResize } from "./controls";
import { SceneParameters } from "./types";
import { makeRenderer, registerSkybox, registerMesh } from "./setup";
import { quat, vec3 } from "gl-matrix";
import textureURL from './assets/earthmap1k.jpg';
import skymapURL from './assets/cylinder_skymap.jpg';
import init, {greet} from "../rust/pkg/sim"


async function run() {
  await init(); // Important: load the wasm module
  const result = greet("Adam");
  console.log(result);
}

run();

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
    cameraAngle: quat.create(),
    sunPosition: vec3.fromValues(0, 0, 100)
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

// Assuming `gl` is your WebGLRenderingContext
function loadTexture(gl: WebGLRenderingContext, textureURL: string): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error('Failed to create texture');
  }

  // Create an image element and load the texture
  const image = new Image();
  image.onload = () => {
    // Bind the texture to the WebGL context
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters (you can modify these for your use case)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Upload the image to the GPU
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Generate mipmaps if needed (optional, depends on your needs)
    gl.generateMipmap(gl.TEXTURE_2D);
  };

  // Set the image source
  image.src = textureURL;

  return texture;
}

// Higher-order function to generate a render function with specific WebGL context and parameters
export function createRenderFunction(gl: WebGL2RenderingContext) {

    let bgVAO = registerSkybox(r);
    let bgTex = loadTexture(gl, skymapURL);

    const sphere = createSphere(0.5, 60, 60, vec3.fromValues(0, 0, 0));
    let sphereVAO = registerMesh(r, sphere);
    let sphereTex = loadTexture(gl, textureURL);

    const sphere2 = createSphere(5, 60, 60, scene.sunPosition);
    let sphereVAO2 = registerMesh(r, sphere2);

    // Return the render function
    return function render() {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        gl.depthFunc(gl.LEQUAL); // Ensure skybox is rendered behind everything

        gl.useProgram(r.bgProgram);
    
        const viewMatrixLocation = gl.getUniformLocation(r.bgProgram, "u_viewMatrix");
        const projectionMatrixLocation = gl.getUniformLocation(r.bgProgram, "u_projectionMatrix");
    
        gl.uniformMatrix4fv(viewMatrixLocation, false, r.modelViewMatrix);
        gl.uniformMatrix4fv(projectionMatrixLocation, false, r.projectionMatrix);
    
        gl.bindVertexArray(bgVAO.vao);
        gl.bindTexture(gl.TEXTURE_2D, bgTex);

        gl.drawElements(gl.TRIANGLES, bgVAO.indexCount, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    
        gl.depthFunc(gl.LESS); // Restore default depth function

        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.useProgram(r.sphereProgram);
        gl.bindVertexArray(sphereVAO);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sphereTex);
        // Set the sampler uniform to texture unit 0
        const textureLocation = gl.getUniformLocation(r.sphereProgram, "uTexture");
        gl.uniform1i(textureLocation, 0);

        gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(sphereVAO2);
        gl.drawElements(gl.TRIANGLES, sphere2.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    
        requestAnimationFrame(render);
    };    
}

createRenderFunction(r.gl)();
