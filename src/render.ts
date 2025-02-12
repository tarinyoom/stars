// Higher-order function to generate a render function with specific WebGL context and parameters
export function createRenderFunction(gl, sphereData) {
    // Return the render function
    return function render() {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
    
        gl.drawElements(gl.TRIANGLES, sphereData.indices.length, gl.UNSIGNED_SHORT, 0);
    
        requestAnimationFrame(render);
    };    
}
