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

const createMesh = (gl, color) => {
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

onMounted(() => {
  let raf = null;
  const { canvas } = createAndMountCanvas();
  const renderer = new WebGLRenderer({ canvas });

  const mesh = createMesh(renderer.gl, [0.6, 0.0, 0.8]);
  mesh.position.set(0, 0, -6.0);

  const mesh2 = createMesh(renderer.gl, [0.3, 0.7, 0.5]);
  mesh2.position.set(0, 0, -6.0);

  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new PerspectiveCamera({
    fov: 45,
    aspect,
    near: 0.1,
    far: 1000,
  });
  camera.position.set(0, 0, 6);

  const rightCamera = new PerspectiveCamera({
    fov: 45,
    aspect,
    near: 0.1,
    far: 1000,
  });
  rightCamera.position.set(0, 0, 6);

  const animate = () => {
    mesh.rotateY(mesh.rotation.y + 0.01);
    mesh2.rotateY(mesh.rotation.y);
    // 开启裁剪测试，设置裁剪区域范围，丢弃在剪裁矩形范围外的片段
    renderer.setScissor(0, 0, canvas.width * 0.5, canvas.height * 0.5);
    renderer.render(mesh, camera);

    // 开启裁剪测试，设置裁剪区域范围
    renderer.setScissor(
      canvas.width * 0.5,
      canvas.height * 0.5,
      canvas.width * 0.5,
      canvas.height * 0.5
    );
    renderer.render(mesh2, rightCamera);
    raf = window.requestAnimationFrame(animate);
  };

  animate();

  onBeforeUnmount(() => window.cancelAnimationFrame(raf));
});
</script>
