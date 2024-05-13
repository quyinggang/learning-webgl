import{l as u,c as d}from"./mat4-f2f89396.js";import{W as p,P as f,B as m,M as w,S as g,T as l,G as M}from"./webgl-bef542ad.js";import{G as h}from"./gm-501001bc.js";import{r as b,o as y,b as U,a as V,c as _}from"./index-9023bf6a.js";const A="/assets/gmlei-04357529.png",F={__name:"MultipleTexture",setup(P){const i=b(null),v=()=>{const n=i.value,e=n.getBoundingClientRect(),t=d(e.width,e.height);return n.appendChild(t),{canvas:t,bounds:e}},x=(n,e)=>{const t=new M,a=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),r=new Uint16Array([0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,14,14,15,12,16,17,18,18,19,16,20,21,22,22,23,20]),s=new Float32Array([0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1]);t.setAttribute("aPosition",new m(a,3)),t.setAttribute("aUV",new m(s,2)),t.setIndex(r);const o=new w({geometry:t,shader:new g({vertex:`
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
        uniform sampler2D uTexture1;
        uniform sampler2D uTexture2;
        varying vec2 vUV;
        void main() {
          vec4 color1 = texture2D(uTexture1, vUV);
          vec4 color2 = texture2D(uTexture2, vUV);
          gl_FragColor = vUV.x > 0.5 ? color1 : color2;
        }
      `,resources:{uTexture1:{type:"texture",value:new l({resource:e[0]})},uTexture2:{type:"texture",value:new l({resource:e[1]})}}})});return o.init(n),o};return y(()=>{let n=null;const{canvas:e}=v(),t=new p({canvas:e});Promise.all([u(h),u(A)]).then(a=>{const r=x(t.gl,a);r.position.set(0,0,-6);const s=e.clientWidth/e.clientHeight,o=new f({fov:45,aspect:s,near:.1,far:1e3});o.position.set(0,0,6);const c=()=>{r.rotateY(r.rotation.y+.01),t.render(r,o),n=window.requestAnimationFrame(c)};c()}),U(()=>window.cancelAnimationFrame(n))}),(n,e)=>(V(),_("div",{ref_key:"boxElementRef",ref:i,class:"box"},null,512))}};export{F as default};
