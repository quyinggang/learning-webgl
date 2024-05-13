import{c as y}from"./mat4-f2f89396.js";import{W as A,R as b,P as _,B as d,M as f,S as w,G as g}from"./webgl-bef542ad.js";import{r as C,o as R,b as V,a as U,c as T}from"./index-21b15c9d.js";const E={__name:"RenderTexture",setup(B){const p=C(null),M=()=>{const n=p.value,t=n.getBoundingClientRect(),e=y(t.width,t.height);return n.appendChild(e),{canvas:e,bounds:t}},h=(n,t)=>{const{color:e}=t,o=new g,c=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),u=new Uint16Array([0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,14,14,15,12,16,17,18,18,19,16,20,21,22,22,23,20]);o.setAttribute("aPosition",new d(c,3)),o.setIndex(u);const a=new f({geometry:o,shader:new w({vertex:`
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
      `,resources:{uColor:{type:"f3v",value:e}}})});return a.init(n),a},P=(n,t)=>{const{texture:e}=t,o=new g,c=new Float32Array([-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,-1,-1,1,1,-1,1,1,1,1,-1,1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1]),u=new Uint16Array([0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,14,14,15,12,16,17,18,18,19,16,20,21,22,22,23,20]),a=new Float32Array([0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1]);o.setAttribute("aPosition",new d(c,3)),o.setAttribute("aUV",new d(a,2)),o.setIndex(u);const m=new f({geometry:o,shader:new w({vertex:`
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
      `,resources:{uTexture:{type:"texture",value:e}}})});return m.init(n),m};return R(()=>{let n=null;const{canvas:t}=M(),e=new A({canvas:t}),o=e.gl,c=window.devicePixelRatio,u=256*c,a=256*c,m=new b(u,a),s=P(o,{texture:m.texture});s.position.set(0,0,-4);const i=h(o,{color:[.3,.5,.6]});i.position.set(0,0,-4);const l=s.position.toArray(),x=t.clientWidth/t.clientHeight,r=new _({fov:45,aspect:x,near:.1,far:1e3});r.position.set(0,6,6),r.lookAt(l[0],l[1],l[2]);const v=()=>{r.setAspect(u/a),r.computeProjectionMatrix(),r.position.set(0,0,4),i.position.set(0,0,-2),i.rotateX(i.rotation.x+.01),i.rotateY(i.rotation.y+.02),i.rotateZ(i.rotation.z+.03),e.setBackground(1,1,1,1),e.setRenderTarget(m),e.render(i,r),r.setAspect(x),r.computeProjectionMatrix(),r.position.set(0,6,6),s.rotateX(s.rotation.x+.001),s.rotateY(s.rotation.y+.001),e.setBackground(0,0,0,1),e.setRenderTarget(null),e.render([s],r),n=window.requestAnimationFrame(v)};v(),V(()=>window.cancelAnimationFrame(n))}),(n,t)=>(U(),T("div",{ref_key:"boxElementRef",ref:p,class:"box"},null,512))}};export{E as default};
