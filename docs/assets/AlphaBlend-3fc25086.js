import{c as m}from"./mat4-f2f89396.js";import{W as p,P as f,B as h,M as v,S as b,G as x}from"./webgl-bef542ad.js";import{r as M,o as g,a as w,c as _}from"./index-21b15c9d.js";const B={__name:"AlphaBlend",setup(C){const i=M(null),u=()=>{const e=i.value,t=e.getBoundingClientRect(),o=m(t.width,t.height);return e.appendChild(o),{canvas:o,bounds:t}},c=(e,t)=>{const{color:o,depthTest:r,blend:s}=t,n=new x,a=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),d=new Uint16Array([0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,14,14,15,12,16,17,18,18,19,16,20,21,22,22,23,20]);n.setAttribute("aPosition",new h(a,3)),n.setIndex(d);const l=new v({geometry:n,shader:new b({vertex:`
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
        uniform vec4 uColor;
        void main() {
          gl_FragColor = uColor;
        }
      `,resources:{uColor:{type:"f4v",value:o}},depthTest:{...r},blend:{...s}})});return l.init(e),l};return g(()=>{const{canvas:e}=u(),t=new p({canvas:e}),o=t.gl,r=c(o,{color:[.6,0,.8,.1],depthTest:{depthWrite:!1},blend:{enable:!0}});r.position.set(0,0,-6);const s=c(o,{color:[1,1,1,1],depthTest:{depthWrite:!0}});s.position.set(1,0,-8);const n=e.clientWidth/e.clientHeight,a=new f({fov:45,aspect:n,near:.1,far:1e3});a.position.set(0,0,6),t.render([s,r],a)}),(e,t)=>(w(),_("div",{ref_key:"boxElementRef",ref:i,class:"box"},null,512))}};export{B as default};
