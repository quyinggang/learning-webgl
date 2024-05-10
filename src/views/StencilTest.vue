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
  const { color, stencil } = config;
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
      stencilTest: { ...stencil },
    }),
  });

  mesh.init(gl);

  return mesh;
};

onMounted(() => {
  let raf = null;
  const { canvas } = createAndMountCanvas();
  const renderer = new WebGLRenderer({ canvas, autoClear: false });
  const gl = renderer.gl;

  const mesh = createMesh(gl, {
    color: [0.6, 0.0, 0.8],
    stencil: {
      enable: true,
      stencilMask: 0xff,
      stencilFunc: gl.ALWAYS,
      stencilRef: 1,
      stencilPass: gl.REPLACE,
    },
  });
  mesh.position.set(0, 0, -6.0);

  const mesh1 = createMesh(gl, {
    color: [1.0, 1.0, 1.0],
    stencil: {
      enable: true,
      stencilMask: 0xff,
      stencilFunc: gl.ALWAYS,
      stencilRef: 0,
      stencilPass: gl.REPLACE,
    },
  });
  mesh1.position.set(0, 0, -6.0);

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
  camera.computeViewMatrix();

  const animate = () => {
    renderer.clear();
    mesh.rotateY(mesh.rotation.y + 0.01);
    // 绘制轮廓，绘制区域深度值为1
    renderer.render(mesh, camera);

    // 绘制物体，绘制区域深度值设置为0，从而实现模板缓冲中相关区域边缘为1内部为0
    mesh1.rotateY(mesh.rotation.y);
    mesh1.scale.set(0.92, 0.92, 0.92);
    renderer.render(mesh1, camera);
    raf = window.requestAnimationFrame(animate);
  };

  animate();

  onBeforeUnmount(() => window.cancelAnimationFrame(raf));
});
</script>
