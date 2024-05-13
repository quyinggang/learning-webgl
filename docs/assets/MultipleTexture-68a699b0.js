import{l as u,c as x}from"./mat4-f2f89396.js";import{W as d,P as f,B as m,M as w,S as g,T as l,G as h}from"./webgl-bef542ad.js";import{G as M}from"./gm-0ebf93b7.js";import{r as b,o as U,b as y,a as V,c as _}from"./index-21b15c9d.js";const A=""+new URL("gmlei-04357529.png",import.meta.url).href,R={__name:"MultipleTexture",setup(P){const s=b(null),v=()=>{const r=s.value,e=r.getBoundingClientRect(),t=x(e.width,e.height);return r.appendChild(t),{canvas:t,bounds:e}},p=(r,e)=>{const t=new h,a=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),n=new Uint16Array([0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,14,14,15,12,16,17,18,18,19,16,20,21,22,22,23,20]),i=new Float32Array([0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1]);t.setAttribute("aPosition",new m(a,3)),t.setAttribute("aUV",new m(i,2)),t.setIndex(n);const o=new w({geometry:t,shader:new g({vertex:`
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
      `,resources:{uTexture1:{type:"texture",value:new l({resource:e[0]})},uTexture2:{type:"texture",value:new l({resource:e[1]})}}})});return o.init(r),o};return U(()=>{let r=null;const{canvas:e}=v(),t=new d({canvas:e});Promise.all([u(M),u(A)]).then(a=>{const n=p(t.gl,a);n.position.set(0,0,-6);const i=e.clientWidth/e.clientHeight,o=new f({fov:45,aspect:i,near:.1,far:1e3});o.position.set(0,0,6);const c=()=>{n.rotateY(n.rotation.y+.01),t.render(n,o),r=window.requestAnimationFrame(c)};c()}),y(()=>window.cancelAnimationFrame(r))}),(r,e)=>(V(),_("div",{ref_key:"boxElementRef",ref:s,class:"box"},null,512))}};export{R as default};
