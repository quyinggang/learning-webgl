import{c as x}from"./mat4-f2f89396.js";import{W as v,P as p,B as w,M as b,S as g,C as h,G as y}from"./webgl-bef542ad.js";import{r as C,o as M,b as _,a as A,c as P}from"./index-21b15c9d.js";const S={__name:"CubeTexture",setup(T){const s=C(null),u=()=>{const n=s.value,t=n.getBoundingClientRect(),e=x(t.width,t.height);return n.appendChild(e),{canvas:e,bounds:t}},l=n=>{const t=document.createElement("canvas");t.width=256,t.height=256;const e=t.getContext("2d");return e.fillStyle="#fff",e.rect(0,0,256,256),e.fill(),e.font="60px serif",e.fillStyle="#000",e.fillText(n,100,100),t},m=(n,t)=>{const e=new y,a=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),o=new Uint16Array([0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,14,14,15,12,16,17,18,18,19,16,20,21,22,22,23,20]);e.setAttribute("aPosition",new w(a,3)),e.setIndex(o);const r=new b({geometry:e,shader:new g({vertex:`
        precision mediump float;
        attribute vec3 aPosition;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying vec3 vNormal;
        void main() {
          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
          vNormal = normalize(aPosition.xyz);
        }
      `,fragment:`
        precision mediump float;
        uniform samplerCube uTexture;
        varying vec3 vNormal;
        void main() {
          gl_FragColor = textureCube(uTexture, normalize(vNormal));
        }
      `,resources:{uTexture:{type:"cubeTexture",value:new h(t)}}})});return r.init(n),r};return M(()=>{let n=null;const{canvas:t}=u(),e=new v({canvas:t}),a=["上","下","左","右","前","后"],o=m(e.gl,a.map(d=>l(d)));o.position.set(0,0,-6);const r=o.position.toArray(),f=t.clientWidth/t.clientHeight,i=new p({fov:45,aspect:f,near:.1,far:1e3});i.position.set(0,6,6),i.lookAt(r[0],r[1],r[2]);const c=()=>{o.rotateY(o.rotation.y+.01),e.render(o,i),n=window.requestAnimationFrame(c)};c(),_(()=>window.cancelAnimationFrame(n))}),(n,t)=>(A(),P("div",{ref_key:"boxElementRef",ref:s,class:"box"},null,512))}};export{S as default};
