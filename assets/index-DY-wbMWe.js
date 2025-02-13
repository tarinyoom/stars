(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))t(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&t(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function t(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const O=`
precision mediump float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

void main() {
    vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = worldPosition.xyz;
    vNormal = normalize(mat3(modelViewMatrix) * normal);
    vTexCoord = texCoord; // Pass UV coordinates to fragment shader

    gl_Position = projectionMatrix * worldPosition;
}
`,V=`
precision mediump float;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vTexCoord;

uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform vec3 viewPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightDirection);
    vec3 viewDir = normalize(viewPosition - vPosition);

    // Ambient lighting
    vec3 ambient = ambientColor;

    // Diffuse lighting (Lambertian reflection)
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = lightColor * diff;

    // Specular lighting (Blinn-Phong reflection)
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
    vec3 specular = lightColor * spec;

    // Procedural checkerboard texture
    float scale = 10.0; // Number of squares in checkerboard pattern
    float check = mod(floor(vTexCoord.x * scale) + floor(vTexCoord.y * scale), 2.0);
    vec3 checkerColor = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), check);

    // Combine texture with lighting
    vec3 finalColor = (ambient + diffuse + specular) * checkerColor;
    gl_FragColor = vec4(finalColor, 1.0);
}
`;function W(e,o,n){const t=[],i=[],a=[],s=[];for(let c=0;c<=o;c++){const f=c*Math.PI/o,m=Math.sin(f),d=Math.cos(f);for(let u=0;u<=n;u++){const w=u*2*Math.PI/n,l=Math.sin(w),A=Math.cos(w)*m,p=d,b=l*m,F=u/n,R=c/o;t.push(e*A,e*p,e*b),i.push(A,p,b),a.push(F,1-R)}}for(let c=0;c<o;c++)for(let f=0;f<n;f++){const m=c*(n+1)+f,d=m+n+1;s.push(m,d,m+1),s.push(d,d+1,m+1)}return{positions:new Float32Array(t),normals:new Float32Array(i),texCoords:new Float32Array(a),indices:new Uint16Array(s)}}var E=1e-6,x=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var e=0,o=arguments.length;o--;)e+=arguments[o]*arguments[o];return Math.sqrt(e)});function H(){var e=new x(16);return x!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function j(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function k(e,o,n,t){var i,a,s,c,f,m,d,u,w,l,g=o[0],A=o[1],p=o[2],b=t[0],F=t[1],R=t[2],T=n[0],S=n[1],_=n[2];return Math.abs(g-T)<E&&Math.abs(A-S)<E&&Math.abs(p-_)<E?j(e):(d=g-T,u=A-S,w=p-_,l=1/Math.hypot(d,u,w),d*=l,u*=l,w*=l,i=F*w-R*u,a=R*d-b*w,s=b*u-F*d,l=Math.hypot(i,a,s),l?(l=1/l,i*=l,a*=l,s*=l):(i=0,a=0,s=0),c=u*s-w*a,f=w*i-d*s,m=d*a-u*i,l=Math.hypot(c,f,m),l?(l=1/l,c*=l,f*=l,m*=l):(c=0,f=0,m=0),e[0]=i,e[1]=c,e[2]=d,e[3]=0,e[4]=a,e[5]=f,e[6]=u,e[7]=0,e[8]=s,e[9]=m,e[10]=w,e[11]=0,e[12]=-(i*g+a*A+s*p),e[13]=-(c*g+f*A+m*p),e[14]=-(d*g+u*A+w*p),e[15]=1,e)}function G(){var e=new x(3);return x!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function M(e,o,n){var t=new x(3);return t[0]=e,t[1]=o,t[2]=n,t}(function(){var e=G();return function(o,n,t,i,a,s){var c,f;for(n||(n=3),t||(t=0),i?f=Math.min(i*n+t,o.length):f=o.length,c=t;c<f;c+=n)e[0]=o[c],e[1]=o[c+1],e[2]=o[c+2],a(e,e,s),o[c]=e[0],o[c+1]=e[1],o[c+2]=e[2];return o}})();const v=document.getElementById("glcanvas"),r=v.getContext("webgl");if(!r)throw console.error("WebGL not supported"),new Error("WebGL not supported");window.addEventListener("resize",Y);v.width=window.innerWidth;v.height=window.innerHeight;r.viewport(0,0,v.width,v.height);function D(e,o,n){const t=e.createShader(o);if(!t)throw new Error("Failed to create shader");if(e.shaderSource(t,n),e.compileShader(t),!e.getShaderParameter(t,e.COMPILE_STATUS))throw console.error(e.getShaderInfoLog(t)),e.deleteShader(t),new Error("Shader compilation failed");return t}const q=D(r,r.VERTEX_SHADER,O),K=D(r,r.FRAGMENT_SHADER,V),h=r.createProgram();if(!h)throw new Error("Failed to create program");r.attachShader(h,q);r.attachShader(h,K);r.linkProgram(h);if(!r.getProgramParameter(h,r.LINK_STATUS))throw console.error(r.getProgramInfoLog(h)),new Error("Program linking failed");r.useProgram(h);const X=new Float32Array([-.5,-1,-.5]),Z=new Float32Array([1,1,1]),$=new Float32Array([.2,.2,.2]),J=new Float32Array([0,0,3]),Q=r.getUniformLocation(h,"lightDirection"),ee=r.getUniformLocation(h,"lightColor"),re=r.getUniformLocation(h,"ambientColor"),te=r.getUniformLocation(h,"viewPosition");r.uniform3fv(Q,X);r.uniform3fv(ee,Z);r.uniform3fv(re,$);r.uniform3fv(te,J);const y=W(.5,30,30),P=r.createBuffer();if(!P)throw new Error("Failed to create position buffer");r.bindBuffer(r.ARRAY_BUFFER,P);r.bufferData(r.ARRAY_BUFFER,y.positions,r.STATIC_DRAW);const C=r.createBuffer();if(!C)throw new Error("Failed to create normal buffer");r.bindBuffer(r.ARRAY_BUFFER,C);r.bufferData(r.ARRAY_BUFFER,y.normals,r.STATIC_DRAW);const B=r.createBuffer();if(!B)throw new Error("Failed to create index buffer");r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,B);r.bufferData(r.ELEMENT_ARRAY_BUFFER,y.indices,r.STATIC_DRAW);const U=r.getAttribLocation(h,"position");r.enableVertexAttribArray(U);r.bindBuffer(r.ARRAY_BUFFER,P);r.vertexAttribPointer(U,3,r.FLOAT,!1,0,0);const I=r.getAttribLocation(h,"normal");r.enableVertexAttribArray(I);r.bindBuffer(r.ARRAY_BUFFER,C);r.vertexAttribPointer(I,3,r.FLOAT,!1,0,0);const L=r.createBuffer();if(!L)throw new Error("Failed to create texture buffer");r.bindBuffer(r.ARRAY_BUFFER,L);r.bufferData(r.ARRAY_BUFFER,y.texCoords,r.STATIC_DRAW);const N=r.getAttribLocation(h,"texCoord");r.enableVertexAttribArray(N);r.bindBuffer(r.ARRAY_BUFFER,L);r.vertexAttribPointer(N,2,r.FLOAT,!1,0,0);const oe=r.getUniformLocation(h,"modelViewMatrix");function ie(e){const n=2*Math.sin(e),t=2*Math.cos(e),a=M(n,0,t),s=M(0,0,0),c=M(0,1,0),f=H();return k(f,a,s,c),f}function ne(e){r.uniformMatrix4fv(oe,!1,ie(e))}const ae=r.getUniformLocation(h,"projectionMatrix");function ce(e,o,n,t){const i=1/Math.tan(e/2);return new Float32Array([i/o,0,0,0,0,i,0,0,0,0,(t+n)/(n-t),-1,0,0,2*t*n/(n-t),0])}function z(e,o){const n=e/o,t=Math.PI/4,s=ce(t,n,.1,100);r.uniformMatrix4fv(ae,!1,s)}function Y(){v.width=window.innerWidth,v.height=window.innerHeight,r.viewport(0,0,v.width,v.height),z(v.width,v.height)}Y();z(v.width,v.height);function se(e,o){let n=0;return function t(){e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST),e.drawElements(e.TRIANGLES,o.indices.length,e.UNSIGNED_SHORT,0),requestAnimationFrame(t),ne(n),n+=.005}}se(r,y)();
