import{c as p}from"./mat4-f2f89396.js";import{B as x,O as v}from"./webgl-bef542ad.js";import{r as S,o as E,b as w,a as R,c as _}from"./index-9023bf6a.js";const T={__name:"ModelMatrix",setup(M){const c=S(null),u=()=>{const n=c.value,t=n.getBoundingClientRect(),e=p(t.width,t.height);return n.appendChild(e),{canvas:e,bounds:t}};class h{constructor(){this.attributes={},this.vertexCount=0}setAttribute(t,e){if(!["aPosition"].includes(t))throw new Error("An error occurred setAttribute");this.attributes[t]=e}setIndex(t){this.indices=t,this.vertexCount=t.length}init(t,e){this.processBuffers(t),this.processVertexAttrib(t,e)}processBuffers(t){const e=this.attributes,r={},s=t.ARRAY_BUFFER;let a=0;for(const[o,i]of Object.entries(e))o==="aPosition"&&(a=i.data.length/i.count),r[o]=this.createBuffer(t,s,i.data);this.buffers=r,this.vertexCount=a}processVertexAttrib(t,e){const{buffers:r,attributes:s}=this,a={};for(const[o,i]of Object.entries(r)){const{count:b}=s[o],A=t.getAttribLocation(e,o);a[o]={count:b,buffer:i,location:A}}this.vertexAttributesInfo=a}createBuffer(t,e,r){const s=t.createBuffer();return t.bindBuffer(e,s),t.bufferData(e,r,t.STATIC_DRAW),s}}class d{constructor(t){this.vertexSource=t.vertex,this.fragmentSource=t.fragment}init(t){this.program=this.createProgram(t)}createProgram(t){const{vertexSource:e,fragmentSource:r}=this,s=this.createShader(t,t.VERTEX_SHADER,e),a=this.createShader(t,t.FRAGMENT_SHADER,r),o=t.createProgram();if(t.attachShader(o,s),t.attachShader(o,a),t.linkProgram(o),t.getProgramParameter(o,t.LINK_STATUS))return o;throw t.deleteProgram(o),new Error("Unable to initialize the shader program")}createShader(t,e,r){const s=t.createShader(e);if(t.shaderSource(s,r),t.compileShader(s),t.getShaderParameter(s,t.COMPILE_STATUS))return s;throw t.deleteShader(s),new Error("An error occurred compiling the shaders")}}class f extends v{constructor(t){super(),this.geometry=t.geometry,this.shader=t.shader}init(t){const{shader:e,geometry:r}=this;e.init(t),r.init(t,e.program);const s=e.program;this.defaultUniforms={uModelMatrix:t.getUniformLocation(s,"uModelMatrix")}}render(t){this.computeModelMatrix(),t.useProgram(this.shader.program),this.updateAttributes(t),this.updateUniforms(t)}updateAttributes(t){const{vertexAttributesInfo:e}=this.geometry;for(const r of Object.values(e)){const{count:s,location:a,buffer:o}=r;t.bindBuffer(t.ARRAY_BUFFER,o),t.vertexAttribPointer(a,s,t.FLOAT,!1,0,0),t.enableVertexAttribArray(a)}}updateUniforms(t){const e=this.modelMatrix,r=this.defaultUniforms;t.uniformMatrix4fv(r.uModelMatrix,!1,e)}}class m{constructor(t){const{canvas:e}=t;this.canvas=t.canvas;const r=e.getContext("webgl");if(this.gl=r,!r)throw new Error("WebGL not supported")}drawElements(t){const e=this.gl;e.drawElements(e.TRIANGLES,t,e.UNSIGNED_SHORT,0)}drawArrays(t){const e=this.gl;e.drawArrays(e.TRIANGLES,0,t)}renderStart(){const{gl:t,canvas:e}=this;t.viewport(0,0,e.width,e.height),t.clearColor(0,0,0,1),t.clearDepth(1),t.enable(t.DEPTH_TEST),t.depthFunc(t.LEQUAL),t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT)}renderScene(t){t.render(this.gl),this.drawArrays(t.geometry.vertexCount)}render(t){this.renderStart(),this.renderScene(t)}}const l=n=>{const t=new h,e=new Float32Array([0,0,0,.5,2,0]);t.setAttribute("aPosition",new x(e,2));const r=new f({geometry:t,shader:new d({vertex:`
        precision mediump float;
        attribute vec3 aPosition;
        uniform mat4 uModelMatrix;
        void main() {
          gl_Position = uModelMatrix * vec4(aPosition, 1.0);
        }
      `,fragment:`
        precision mediump float;
        void main() {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
      `})});return r.init(n),r};return E(()=>{let n=null;const{canvas:t}=u(),e=new m({canvas:t}),r=l(e.gl);r.position.set(.1,.1,.3);const s=()=>{r.rotateY(r.rotation.y+.01),e.render(r),n=window.requestAnimationFrame(s)};s(),w(()=>window.cancelAnimationFrame(n))}),(n,t)=>(R(),_("div",{ref_key:"boxElementRef",ref:c,class:"box"},null,512))}};export{T as default};