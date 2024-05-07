<template>
  <div ref="boxElementRef" class="box"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createCanvas } from '@/utils';
import {
  PerspectiveCamera,
  BufferAttribute,
  Mesh,
  Shader,
  Geometry,
  WebGLRenderer,
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
  const faceNormalList = [
    // 正面
    [0, 0, 1],
    // 背面
    [0, 0, -1],
    // 顶部
    [0, 1, 0],
    // 底部,
    [0, -1, 0],
    // 右面
    [1, 0, 0],
    // 左面
    [-1, 0, 0],
  ];
  const array = [];
  for (const item of faceNormalList) {
    for (let index = 0; index < 4; index++) {
      array.push(...item);
    }
  }
  // 定义每个顶点的法向量，法向量方向为物体表面的朝向，垂直于物体表面
  // 应用光照，必须定义模型的法向量
  const normals = new Float32Array(array);

  geometry.setAttribute('aPosition', new BufferAttribute(positions, 3));
  geometry.setAttribute('aNormal', new BufferAttribute(normals, 3));
  geometry.setIndex(indices);

  /**
   * 基于经典的 Phong 光照模型实现：
   * - 应用环境光、平行光
   * - 仅仅实现光的漫反射
   */
  const mesh = new Mesh({
    geometry,
    shader: new Shader({
      vertex: `
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
      `,
      fragment: `
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
      `,
      resources: {
        // 平行光方向
        uLightDirection: {
          type: 'f3v',
          value: [0.0, 0.3, 0.5],
        },
        // 平行光颜色
        uLightColor: {
          type: 'f3v',
          value: [0.2, 1.0, 0.2],
        },
        // 环境光颜色
        uAmbientColor: {
          type: 'f3v',
          value: [0.0, 0.0, 0.0],
        },
        uNormalMatrix: {
          type: 'normalMatrix',
        },
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

  const mesh = createMesh(renderer.gl);
  mesh.position.set(0, 0, -3.0);

  const target = mesh.position.toArray();
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new PerspectiveCamera({
    fov: 45,
    aspect,
    near: 0.1,
    far: 1000,
  });
  camera.position.set(0, 6, 3);
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
