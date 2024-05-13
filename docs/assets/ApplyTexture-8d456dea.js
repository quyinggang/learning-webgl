import{l as d,c as v}from"./mat4-f2f89396.js";import{G as f}from"./gm-0ebf93b7.js";import{W as p,P as x,B as u,M as w,S as g,T as h,G as M}from"./webgl-bef542ad.js";import{r as b,o as y,b as _,a as A,c as U}from"./index-21b15c9d.js";const E={__name:"ApplyTexture",setup(V){const s=b(null),m=()=>{const n=s.value,e=n.getBoundingClientRect(),t=v(e.width,e.height);return n.appendChild(t),{canvas:t,bounds:e}},l=(n,e)=>{const t=new M,o=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),r=new Uint16Array([0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,14,14,15,12,16,17,18,18,19,16,20,21,22,22,23,20]),i=new Float32Array([0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1]);t.setAttribute("aPosition",new u(o,3)),t.setAttribute("aUV",new u(i,2)),t.setIndex(r);const a=new w({geometry:t,shader:new g({vertex:`
        precision mediump float;
        attribute vec3 aPosition;
        attribute vec2 aUV;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying vec2 vUV;
        void main() {
          vUV = aUV;
          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
        }
      `,fragment:`
        precision mediump float;
        uniform sampler2D uTexture;
        varying vec2 vUV;
        void main() {
          gl_FragColor = texture2D(uTexture, vUV);
        }
      `,resources:{uTexture:{type:"texture",value:new h({resource:e})}}})});return a.init(n),a};return y(()=>{let n=null;const{canvas:e}=m(),t=new p({canvas:e});d(f).then(o=>{const r=l(t.gl,o);r.position.set(0,0,-6);const i=e.clientWidth/e.clientHeight,a=new x({fov:45,aspect:i,near:.1,far:1e3});a.position.set(0,0,6);const c=()=>{r.rotateY(r.rotation.y+.01),t.render(r,a),n=window.requestAnimationFrame(c)};c()}),_(()=>window.cancelAnimationFrame(n))}),(n,e)=>(A(),U("div",{ref_key:"boxElementRef",ref:s,class:"box"},null,512))}};export{E as default};
