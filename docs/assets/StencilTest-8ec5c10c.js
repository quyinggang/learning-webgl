import{c as d}from"./mat4-f2f89396.js";import{W as p,P as v,B as x,M as w,S as A,G as M}from"./webgl-bef542ad.js";import{r as h,o as b,b as g,a as C,c as P}from"./index-9023bf6a.js";const k={__name:"StencilTest",setup(_){const l=h(null),f=()=>{const o=l.value,e=o.getBoundingClientRect(),n=d(e.width,e.height);return o.appendChild(n),{canvas:n,bounds:e}},u=(o,e)=>{const{color:n,stencil:s}=e,t=new M,a=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),r=new Uint16Array([0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,14,14,15,12,16,17,18,18,19,16,20,21,22,22,23,20]);t.setAttribute("aPosition",new x(a,3)),t.setIndex(r);const i=new w({geometry:t,shader:new A({vertex:`
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
      `,resources:{uColor:{type:"f3v",value:n}},stencilTest:{...s}})});return i.init(o),i};return b(()=>{let o=null;const{canvas:e}=f(),n=new p({canvas:e,autoClear:!1}),s=n.gl,t=u(s,{color:[.6,0,.8],stencil:{enable:!0,stencilMask:255,stencilFunc:s.ALWAYS,stencilRef:1,stencilPass:s.REPLACE}});t.position.set(0,0,-6);const a=u(s,{color:[1,1,1],stencil:{enable:!0,stencilMask:255,stencilFunc:s.ALWAYS,stencilRef:0,stencilPass:s.REPLACE}});a.position.set(0,0,-6);const r=t.position.toArray(),i=e.clientWidth/e.clientHeight,c=new v({fov:45,aspect:i,near:.1,far:1e3});c.position.set(0,6,6),c.lookAt(r[0],r[1],r[2]);const m=()=>{n.clear(),t.rotateY(t.rotation.y+.01),n.render(t,c),a.rotateY(t.rotation.y),a.scale.set(.92,.92,.92),n.render(a,c),o=window.requestAnimationFrame(m)};m(),g(()=>window.cancelAnimationFrame(o))}),(o,e)=>(C(),P("div",{ref_key:"boxElementRef",ref:l,class:"box"},null,512))}};export{k as default};
