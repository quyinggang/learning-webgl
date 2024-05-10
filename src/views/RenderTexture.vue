<template>
  <div ref="boxElementRef" class="box"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createCanvas } from '@/utils';
import {
  WebGLRenderer,
  Mesh,
  Geometry,
  Shader,
  BufferAttribute,
  PerspectiveCamera,
} from '@/utils/webgl';

const boxElementRef = ref(null);

const createAndMountCanvas = () => {
  const boxElement = boxElementRef.value;
  const boundingRect = boxElement.getBoundingClientRect();
  const canvasElement = createCanvas(boundingRect.width, boundingRect.height);

  boxElement.appendChild(canvasElement);

  return { canvas: canvasElement, bounds: boundingRect };
};

const createMesh = (gl, config) => {
  const { color } = config;
  const geometry = new Geometry();
  const positions = new Float32Array([
    // Front face
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 2, 3, 0,

    4, 5, 6, 6, 7, 4,

    8, 9, 10, 10, 11, 8,

    12, 13, 14, 14, 15, 12,

    16, 17, 18, 18, 19, 16,

    20, 21, 22, 22, 23, 20,
  ]);

  geometry.setAttribute('aPosition', new BufferAttribute(positions, 3));
  geometry.setIndex(indices);

  const mesh = new Mesh({
    geometry,
    shader: new Shader({
      vertex: `
        precision mediump float;
        attribute vec3 aPosition;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;
        void main() {
          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
        }
      `,
      fragment: `
        precision mediump float;
        uniform vec3 uColor;
        void main() {
          gl_FragColor = vec4(uColor, 1.0);
        }
      `,
      resources: {
        uColor: { type: 'f3v', value: color },
      },
    }),
  });

  mesh.init(gl);

  return mesh;
};

// const createPlane = (gl, source) => {
//   const geometry = new Geometry();
//   const positions = new Float32Array([
//     -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,
//   ]);
//   const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);

//   // 纹理坐标是0.0 ～ 1.0范围的，定义uvs需要与顶点一一对应
//   const uvs = new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0]);
//   geometry.setAttribute('aPosition', new BufferAttribute(positions, 2));
//   geometry.setAttribute('aUV', new BufferAttribute(uvs, 2));
//   geometry.setIndex(indices);

//   const mesh = new Mesh({
//     geometry,
//     shader: new Shader({
//       vertex: `
//         precision mediump float;
//         attribute vec3 aPosition;
//         attribute vec2 aUV;
//         uniform mat4 uModelMatrix;
//         uniform mat4 uViewMatrix;
//         uniform mat4 uProjectionMatrix;
//         varying vec2 vUV;
//         void main() {
//           vUV = aUV;
//           gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
//         }
//       `,
//       fragment: `
//         precision mediump float;
//         uniform sampler2D uTexture;
//         varying vec2 vUV;
//         void main() {
//           gl_FragColor = texture2D(uTexture, vUV);
//         }
//       `,
//       resources: {
//         uTexture: { type: 'texture', value: source },
//       },
//     }),
//   });

//   mesh.init(gl);

//   return mesh;
// };

onMounted(() => {
  let raf = null;
  const { canvas } = createAndMountCanvas();
  const renderer = new WebGLRenderer({ canvas });
  const gl = renderer.gl;

  const mesh = createMesh(gl, {
    color: [0.6, 0.0, 0.8],
  });
  mesh.position.set(-1.0, 0, -6.0);

  const mesh1 = createMesh(gl, {
    color: [0.3, 0.5, 0.6],
  });
  mesh1.position.set(3.0, 0.0, -8.0);

  const target = mesh.position.toArray();
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new PerspectiveCamera({
    fov: 45,
    aspect,
    near: 0.1,
    far: 1000,
  });
  camera.position.set(0, 6, 6);
  camera.lookAt(target[0], target[1], target[2]);

  const animate = () => {
    mesh.rotateY(mesh.rotation.y + 0.01);
    mesh1.rotateX(mesh1.rotation.x + 0.01);
    renderer.render([mesh, mesh1], camera);
    raf = window.requestAnimationFrame(animate);
  };

  animate();

  onBeforeUnmount(() => window.cancelAnimationFrame(raf));
});
</script>
