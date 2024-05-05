<template>
  <div ref="boxElementRef" class="box"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createCanvas } from '@/utils';

const boxElementRef = ref(null);

const createAndMountCanvas = () => {
  const boxElement = boxElementRef.value;
  const boundingRect = boxElement.getBoundingClientRect();
  const canvasElement = createCanvas(boundingRect.width, boundingRect.height);

  boxElement.appendChild(canvasElement);

  return { canvas: canvasElement, bounds: boundingRect };
};

onMounted(() => {
  const { canvas } = createAndMountCanvas();

  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL not supported');
  }

  setTimeout(() => {
    alert('获取WebGL Context成功，当前浏览器支持WebGL');
  }, 1000);
});
</script>
