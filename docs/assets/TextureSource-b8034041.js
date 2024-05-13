import{c as h}from"./mat4-f2f89396.js";import{W as y,T as d,P as M,B as v,M as b,S as V,G as _}from"./webgl-bef542ad.js";import{r as E,o as U,b as A,a as C,c as P}from"./index-9023bf6a.js";const T="/assets/gm-8dde0536.mp4",k={__name:"TextureSource",setup(S){const i=E(null),f=()=>{const t=i.value,e=t.getBoundingClientRect(),n=h(e.width,e.height);return t.appendChild(n),{canvas:n,bounds:e}},p=()=>new Promise(t=>{let e=!1,n=!1;const r=document.createElement("video");r.muted=!0,r.crossOrigin="anonymous",r.loop=!0,r.preload="metadata",r.addEventListener("playing",()=>{e=!0,a()},!0),r.addEventListener("timeupdate",()=>{n=!0,a()},!0);const a=()=>{e&&n&&t(r)};r.src=T,r.play()}),x=()=>{const t=document.createElement("canvas");t.width=256,t.height=256;const e=t.getContext("2d");return e.fillStyle="#fff",e.rect(0,0,256,256),e.fill(),e.fillStyle="#000",e.fillText("Canvas纹理数据",100,100),t},c=(t,e)=>{const n=new _,r=new Float32Array([-1,1,-1,-1,1,-1,1,1]),a=new Uint16Array([0,1,2,2,3,0]),o=new Float32Array([0,0,0,1,1,1,1,0]);n.setAttribute("aPosition",new v(r,2)),n.setAttribute("aUV",new v(o,2)),n.setIndex(a);const s=new b({geometry:n,shader:new V({vertex:`
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
      `,resources:{uTexture:{type:"texture",value:e}}})});return s.init(t),s};return U(()=>{let t=null;const{canvas:e}=f(),n=new y({canvas:e});p().then(r=>{const a=new d({resource:r,frameUpdate:!0}),o=c(n.gl,a);o.position.set(-1.5,.5,-2);const s=x(),w=new d({resource:s}),u=c(n.gl,w);u.position.set(1.5,.5,-2);const g=e.clientWidth/e.clientHeight,l=new M({fov:45,aspect:g,near:.1,far:1e3});l.position.set(0,0,3);const m=()=>{n.render([o,u],l),t=window.requestAnimationFrame(m)};m()}),A(()=>window.cancelAnimationFrame(t))}),(t,e)=>(C(),P("div",{ref_key:"boxElementRef",ref:i,class:"box"},null,512))}};export{k as default};
