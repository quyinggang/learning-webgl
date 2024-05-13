import{c as d}from"./mat4-f2f89396.js";import{W as p,P as g,B as m,M as h,S as x,G as b}from"./webgl-bef542ad.js";import{r as w,o as y,b as M,a as A,c as C}from"./index-21b15c9d.js";const B={__name:"ApplyLight",setup(N){const c=w(null),u=()=>{const t=c.value,e=t.getBoundingClientRect(),o=d(e.width,e.height);return t.appendChild(o),{canvas:o,bounds:e}},f=t=>{const e=new b,o=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),n=new Uint16Array([0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,14,14,15,12,16,17,18,18,19,16,20,21,22,22,23,20]),r=[[0,0,1],[0,0,-1],[0,1,0],[0,-1,0],[1,0,0],[-1,0,0]],s=[];for(const v of r)for(let l=0;l<4;l++)s.push(...v);const a=new Float32Array(s);e.setAttribute("aPosition",new m(o,3)),e.setAttribute("aNormal",new m(a,3)),e.setIndex(n);const i=new h({geometry:e,shader:new x({vertex:`
        precision mediump float;
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uNormalMatrix;
        varying vec3 vNormal;
        void main() {
          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
          vNormal = normalize(uNormalMatrix * vec4(aNormal, 1.0)).xyz;
        }
      `,fragment:`
        precision mediump float;
        uniform vec3 uLightDirection;
        uniform vec3 uLightColor;
        uniform vec3 uAmbientColor;
        varying vec3 vNormal;
        void main() {
          // 环境光
          vec3 ambient = uAmbientColor;

          // 漫反射
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(uLightDirection);
          float diff = max(dot(normal, lightDir), 0.0);
          vec3 diffuse = uLightColor * diff;

          vec3 finalColor = diffuse + ambient;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,resources:{uLightDirection:{type:"f3v",value:[0,.3,.5]},uLightColor:{type:"f3v",value:[.2,1,.2]},uAmbientColor:{type:"f3v",value:[0,0,0]},uNormalMatrix:{type:"normalMatrix"}}})});return i.init(t),i};return y(()=>{let t=null;const{canvas:e}=u(),o=new p({canvas:e}),n=f(o.gl);n.position.set(0,0,-3);const r=n.position.toArray(),s=e.clientWidth/e.clientHeight,a=new g({fov:45,aspect:s,near:.1,far:1e3});a.position.set(0,6,3),a.lookAt(r[0],r[1],r[2]);const i=()=>{n.rotateY(n.rotation.y+.01),o.render(n,a),t=window.requestAnimationFrame(i)};i(),M(()=>window.cancelAnimationFrame(t))}),(t,e)=>(A(),C("div",{ref_key:"boxElementRef",ref:c,class:"box"},null,512))}};export{B as default};
