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
  Texture,
} from '@/utils/webgl';
import GMVideo from '@/assets/gm.mp4';

const boxElementRef = ref(null);

const createAndMountCanvas = () => {
  const boxElement = boxElementRef.value;
  const boundingRect = boxElement.getBoundingClientRect();
  const canvasElement = createCanvas(boundingRect.width, boundingRect.height);

  boxElement.appendChild(canvasElement);

  return { canvas: canvasElement, bounds: boundingRect };
};

const createVideo = () => {
  return new Promise((resolve) => {
    let playing = false;
    let timeupdate = false;
    const videoElement = document.createElement('video');
    videoElement.muted = true;
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.preload = 'metadata';

    videoElement.addEventListener(
      'playing',
      () => {
        playing = true;
        checkReady();
      },
      true
    );

    videoElement.addEventListener(
      'timeupdate',
      () => {
        timeupdate = true;
        checkReady();
      },
      true
    );

    const checkReady = () => {
      if (playing && timeupdate) {
        resolve(videoElement);
      }
    };
    videoElement.src = GMVideo;
    videoElement.play();
  });
};
const createCanvasSource = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.rect(0, 0, 256, 256);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.fillText('Canvas纹理数据', 100, 100);
  return canvas;
};

const createMesh = (gl, texture) => {
  const geometry = new Geometry();
  const positions = new Float32Array([
    -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,
  ]);
  const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);

  // 纹理坐标是0.0 ～ 1.0范围的，定义uvs需要与顶点一一对应
  const uvs = new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0]);
  geometry.setAttribute('aPosition', new BufferAttribute(positions, 2));
  geometry.setAttribute('aUV', new BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  const mesh = new Mesh({
    geometry,
    shader: new Shader({
      vertex: `
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
      `,
      fragment: `
        precision mediump float;
        uniform sampler2D uTexture;
        varying vec2 vUV;
        void main() {
          gl_FragColor = texture2D(uTexture, vUV);
        }
      `,
      /**
       * webgl纹理数据可以来源于
       * - ImageBitmap
       * - HTMLImageElement
       * - HTMLVideoElement
       * - HTMLCanvasElement
       */
      resources: {
        uTexture: { type: 'texture', value: texture },
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

  createVideo().then((video) => {
    const videoTexture = new Texture({ resource: video, frameUpdate: true });
    const mesh = createMesh(renderer.gl, videoTexture);
    mesh.position.set(-1.5, 0.5, -2.0);

    const canvasSource = createCanvasSource();
    const canvasTexture = new Texture({ resource: canvasSource });
    const mesh2 = createMesh(renderer.gl, canvasTexture);
    mesh2.position.set(1.5, 0.5, -2.0);

    const aspect = canvas.clientWidth / canvas.clientHeight;
    const camera = new PerspectiveCamera({
      fov: 45,
      aspect,
      near: 0.1,
      far: 1000,
    });
    camera.position.set(0, 0, 3);
    camera.computeViewMatrix();

    const animate = () => {
      renderer.render([mesh, mesh2], camera);
      raf = window.requestAnimationFrame(animate);
    };

    animate();
  });

  onBeforeUnmount(() => window.cancelAnimationFrame(raf));
});
</script>
