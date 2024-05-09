<template>
  <div ref="boxElementRef" class="box"></div>
</template>

<script setup>
import { ref, onMounted, watchEffect, onBeforeUnmount } from 'vue';
import { createCanvas } from '@/utils';
import {
  WebGLRenderer,
  Mesh,
  Geometry,
  Shader,
  BufferAttribute,
  PerspectiveCamera,
} from '@/utils/webgl';
import { GUI } from 'dat.gui';

const boxElementRef = ref(null);
const depthVisible = ref(true);

const createDatGUI = () => {
  const gui = new GUI();
  const config = {
    enableDepth: () => {
      depthVisible.value = true;
    },
    disableDepth: () => {
      depthVisible.value = false;
    },
  };
  gui.add(config, 'enableDepth').name('开启深度测试');
  gui.add(config, 'disableDepth').name('关闭深度测试');
  return gui;
};

const createAndMountCanvas = () => {
  const boxElement = boxElementRef.value;
  const boundingRect = boxElement.getBoundingClientRect();
  const canvasElement = createCanvas(boundingRect.width, boundingRect.height);

  boxElement.appendChild(canvasElement);

  return { canvas: canvasElement, bounds: boundingRect };
};

const createMesh = (gl, color) => {
  const geometry = new Geometry();
  const positions = new Float32Array([
    -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,
  ]);
  const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);

  geometry.setAttribute('aPosition', new BufferAttribute(positions, 2));
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

onMounted(() => {
  const { canvas } = createAndMountCanvas();
  const renderer = new WebGLRenderer({ canvas });

  const mesh = createMesh(renderer.gl, [0.6, 0.0, 0.8]);
  mesh.position.set(-0.5, 0, -4.0);

  const mesh2 = createMesh(renderer.gl, [0.3, 0.7, 0.5]);
  mesh2.position.set(0.5, 0, -6.0);

  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new PerspectiveCamera({
    fov: 45,
    aspect,
    near: 0.1,
    far: 1000,
  });
  camera.position.set(0, 0, 6);
  camera.computeViewMatrix();

  const gui = createDatGUI();
  gui.open();

  watchEffect(() => {
    renderer.setDepthTest(depthVisible.value);
    // 深度测试决定了物体的遮挡关系，mesh的深度 < mesh2的
    renderer.render([mesh, mesh2], camera);
  });

  onBeforeUnmount(() => gui.destroy());
});
</script>
