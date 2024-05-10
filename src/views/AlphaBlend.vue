<template>
  <div ref="boxElementRef" class="box"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
  const { color, depthTest, blend } = config;
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
        uniform vec4 uColor;
        void main() {
          gl_FragColor = uColor;
        }
      `,
      resources: {
        uColor: { type: 'f4v', value: color },
      },
      depthTest: { ...depthTest },
      blend: { ...blend },
    }),
  });

  mesh.init(gl);

  return mesh;
};

onMounted(() => {
  const { canvas } = createAndMountCanvas();
  const renderer = new WebGLRenderer({ canvas });
  const gl = renderer.gl;

  const mesh = createMesh(gl, {
    color: [0.6, 0.0, 0.8, 0.1],
    depthTest: {
      depthWrite: false,
    },
    blend: {
      enable: true,
    },
  });
  mesh.position.set(0, 0, -6.0);

  const mesh1 = createMesh(gl, {
    color: [1.0, 1.0, 1.0, 1.0],
    depthTest: {
      depthWrite: true,
    },
  });
  mesh1.position.set(1.0, 0, -8.0);

  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new PerspectiveCamera({
    fov: 45,
    aspect,
    near: 0.1,
    far: 1000,
  });
  camera.position.set(0, 0, 6);

  /**
   * 使用颜色的alpha实现的半透明物体生效需要：
   * - 开启混合
   * - 场景中共存透明和非透明物体，深度值决定了物体遮挡关系，所以绘制需要考虑绘制顺序
   *   - 首先绘制不透明物体
   *   - 然后绘制透明物体，关闭深度写入，这样才会可以看到透明物体背后的物体，否则的话重新写入深度就导致后面的物体被遮挡
   */
  // mesh半透明，并且mesh深度 < mesh1的
  renderer.render([mesh1, mesh], camera);
});
</script>
