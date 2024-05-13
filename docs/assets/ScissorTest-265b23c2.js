import{c as f}from"./mat4-f2f89396.js";import{W as h,P as l,B as p,M as v,S as w,G as g}from"./webgl-bef542ad.js";import{r as x,o as M,b,a as _,c as C}from"./index-21b15c9d.js";const E={__name:"ScissorTest",setup(y){const a=x(null),d=()=>{const o=a.value,e=o.getBoundingClientRect(),t=f(e.width,e.height);return o.appendChild(t),{canvas:t,bounds:e}},s=(o,e)=>{const t=new g,n=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),r=new Uint16Array([0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,14,14,15,12,16,17,18,18,19,16,20,21,22,22,23,20]);t.setAttribute("aPosition",new p(n,3)),t.setIndex(r);const i=new v({geometry:t,shader:new w({vertex:`
        precision mediump float;
        attribute vec3 aPosition;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        void main() {
          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
        }
      `,fragment:`
        precision mediump float;
        uniform vec3 uColor;
        void main() {
          gl_FragColor = vec4(uColor, 1.0);
        }
      `,resources:{uColor:{type:"f3v",value:e}}})});return i.init(o),i};return M(()=>{let o=null;const{canvas:e}=d(),t=new h({canvas:e}),n=s(t.gl,[.6,0,.8]);n.position.set(0,0,-6);const r=s(t.gl,[.3,.7,.5]);r.position.set(0,0,-6);const i=e.clientWidth/e.clientHeight,c=new l({fov:45,aspect:i,near:.1,far:1e3});c.position.set(0,0,6);const m=new l({fov:45,aspect:i,near:.1,far:1e3});m.position.set(0,0,6);const u=()=>{n.rotateY(n.rotation.y+.01),r.rotateY(n.rotation.y),t.setScissor(0,0,e.width*.5,e.height*.5),t.render(n,c),t.setScissor(e.width*.5,e.height*.5,e.width*.5,e.height*.5),t.render(r,m),o=window.requestAnimationFrame(u)};u(),b(()=>window.cancelAnimationFrame(o))}),(o,e)=>(_(),C("div",{ref_key:"boxElementRef",ref:a,class:"box"},null,512))}};export{E as default};
