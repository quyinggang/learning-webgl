import{c as u}from"./mat4-f2f89396.js";import{W as d,P as v,B as c,M as f,S as p,G as w}from"./webgl-bef542ad.js";import{r as x,o as b,b as g,a as h,c as C}from"./index-9023bf6a.js";const P={__name:"ElementIndex",setup(M){const i=x(null),l=()=>{const t=i.value,e=t.getBoundingClientRect(),n=u(e.width,e.height);return t.appendChild(n),{canvas:n,bounds:e}},m=t=>{const e=new w,n=new Float32Array([-1,-1,1,-1,1,1,-1,1]),o=new Float32Array([1,1,1,0,1,1,0,0,1,0,0,0]),a=new Uint16Array([0,1,2,2,3,0]);e.setAttribute("aPosition",new c(n,2)),e.setAttribute("aColor",new c(o,3)),e.setIndex(a);const r=new f({geometry:e,shader:new p({vertex:`
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
      `})});return r.init(t),r};return b(()=>{let t=null;const{canvas:e}=l(),n=new d({canvas:e}),o=m(n.gl);o.position.set(0,0,-6);const a=e.clientWidth/e.clientHeight,r=new v({fov:45,aspect:a,near:.1,far:1e3});r.position.set(0,0,6);const s=()=>{o.rotateY(o.rotation.y+.01),n.render(o,r),t=window.requestAnimationFrame(s)};s(),g(()=>window.cancelAnimationFrame(t))}),(t,e)=>(h(),C("div",{ref_key:"boxElementRef",ref:i,class:"box"},null,512))}};export{P as default};
