import{c as u}from"./mat4-f2f89396.js";import{W as d,P as v,B as c,M as f,S as p,G as w}from"./webgl-bef542ad.js";import{r as C,o as b,b as g,a as h,c as x}from"./index-21b15c9d.js";const P={__name:"ApplyColor",setup(M){const a=C(null),l=()=>{const t=a.value,e=t.getBoundingClientRect(),o=u(e.width,e.height);return t.appendChild(o),{canvas:o,bounds:e}},m=t=>{const e=new w,o=new Float32Array([1,1,-1,1,1,-1]),n=new Float32Array([1,1,1,0,1,1,0,0,1]);e.setAttribute("aPosition",new c(o,2)),e.setAttribute("aColor",new c(n,3));const r=new f({geometry:e,shader:new p({vertex:`
        precision mediump float;
        attribute vec3 aPosition;
        attribute vec3 aColor;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying vec3 vColor;
        void main() {
          vColor = aColor;
          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
        }
      `,fragment:`
        precision mediump float;
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
        }
      `})});return r.init(t),r};return b(()=>{let t=null;const{canvas:e}=l(),o=new d({canvas:e}),n=m(o.gl);n.position.set(0,0,-6);const r=e.clientWidth/e.clientHeight,i=new v({fov:45,aspect:r,near:.1,far:1e3});i.position.set(0,0,6);const s=()=>{n.rotateY(n.rotation.y+.01),o.render(n,i),t=window.requestAnimationFrame(s)};s(),g(()=>window.cancelAnimationFrame(t))}),(t,e)=>(h(),x("div",{ref_key:"boxElementRef",ref:a,class:"box"},null,512))}};export{P as default};
