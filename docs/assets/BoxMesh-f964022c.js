import{c as v}from"./mat4-f2f89396.js";import{W as f,P as p,B as l,M as h,S as w,G as x}from"./webgl-bef542ad.js";import{r as M,o as b,b as g,a as C,c as _}from"./index-9023bf6a.js";const E={__name:"BoxMesh",setup(y){const s=M(null),m=()=>{const o=s.value,e=o.getBoundingClientRect(),n=v(e.width,e.height);return o.appendChild(n),{canvas:n,bounds:e}},u=o=>{const e=new x,n=new Float32Array([-1,-1,1,1,-1,1,1,1,1,1,1,1,-1,1,1,-1,-1,1,-1,-1,-1,1,-1,-1,1,1,-1,1,1,-1,-1,1,-1,-1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,1,-1,1,-1,-1,1,-1,-1,-1,1,-1,-1,1,1,-1,1,1,1,1,1,1,1,-1,1,1,-1,-1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,1,-1,1,-1,-1,-1,-1]),t=[],i=n.length;for(let c=0;c<i;c++){const d=Number(Math.random().toPrecision(1));t.push(d)}const a=new Float32Array(t);e.setAttribute("aPosition",new l(n,3)),e.setAttribute("aColor",new l(a,3));const r=new h({geometry:e,shader:new w({vertex:`
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
      `})});return r.init(o),r};return b(()=>{let o=null;const{canvas:e}=m(),n=new f({canvas:e}),t=u(n.gl);t.position.set(0,0,-6);const i=e.clientWidth/e.clientHeight,a=new p({fov:45,aspect:i,near:.1,far:1e3});a.position.set(0,0,6);const r=()=>{t.rotateY(t.rotation.y+.01),t.rotateX(t.rotation.x+.01),n.render(t,a),o=window.requestAnimationFrame(r)};r(),g(()=>window.cancelAnimationFrame(o))}),(o,e)=>(C(),_("div",{ref_key:"boxElementRef",ref:s,class:"box"},null,512))}};export{E as default};
