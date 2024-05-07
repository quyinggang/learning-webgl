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

const createMesh = (gl) => {
  const geometry = new Geometry();
  const positions = new Float32Array([
    -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
  ]);
  const colors = new Float32Array([
    1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
  ]);
  // 索引表示顶点在数组的下标，注意顶点顺序对绘制的影响
  // 顶点的定义顺序应该考虑法向量的方向，使用右手螺旋定则确定方向
  const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
  geometry.setAttribute('aPosition', new BufferAttribute(positions, 2));
  geometry.setAttribute('aColor', new BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  const mesh = new Mesh({
    geometry,
    shader: new Shader({
      vertex: `
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
      `,
      fragment: `
        precision mediump float;
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
        }
      `,
    }),
  });

  mesh.init(gl);

  return mesh;
};

onMounted(() => {
  let raf = null;
  const { canvas } = createAndMountCanvas();
  const renderer = new WebGLRenderer({ canvas });

  const mesh = createMesh(renderer.gl);
  mesh.position.set(0, 0, -6.0);

  const target = mesh.position.toArray();
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new PerspectiveCamera({
    fov: 45,
    aspect,
    near: 0.1,
    far: 1000,
  });
  camera.position.set(0, 0, -6);
  camera.lookAt(target[0], target[1], target[2]);
  camera.computeViewMatrix();
  renderer.setCamera(camera);

  const animate = () => {
    mesh.rotateY(mesh.rotation.y + 0.01);
    renderer.render(mesh);
    raf = window.requestAnimationFrame(animate);
  };

  animate();

  onBeforeUnmount(() => window.cancelAnimationFrame(raf));
});
</script>
