<template>
  <div ref="boxElementRef" class="box"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { mat4 } from 'gl-matrix';
import { createCanvas } from '@/utils';

const boxElementRef = ref(null);

const createAndMountCanvas = () => {
  const boxElement = boxElementRef.value;
  const boundingRect = boxElement.getBoundingClientRect();
  const canvasElement = createCanvas(boundingRect.width, boundingRect.height);

  boxElement.appendChild(canvasElement);

  return { canvas: canvasElement, bounds: boundingRect };
};

class BufferAttribute {
  constructor(data, count) {
    this.data = data;
    this.count = count;
  }
}

class Geometry {
  constructor() {
    this.attributes = {};
  }
  setAttribute(attr, value) {
    if (!['aPosition', 'aColor'].includes(attr)) {
      throw new Error('An error occurred setAttribute');
    }
    this.attributes[attr] = value;
  }
  init(gl) {
    const attributes = this.attributes;
    const buffers = {};
    for (const [key, value] of Object.entries(attributes)) {
      buffers[key] = this.createBuffer(gl, value.data);
    }
    this.buffers = buffers;
  }
  createBuffer(gl, data) {
    // 创建WebGL缓冲对象
    const buffer = gl.createBuffer();
    /*
      将缓冲对象绑定到对应的目标
      - gl.ARRAY_BUFFER: 包含顶点属性的 Buffer，如顶点坐标，纹理坐标数据或顶点颜色数据
      - gl.ELEMENT_ARRAY_BUFFER: 用于元素索引的 Buffer
    */
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // 创建并初始化缓冲对象的数据存储区
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buffer;
  }
}

class Shader {
  constructor(config) {
    this.vertexSource = config.vertex;
    this.fragmentSource = config.fragment;
  }
  init(gl) {
    const program = this.createProgram(gl);
    this.program = program;
  }
  createProgram(gl) {
    const { vertexSource, fragmentSource } = this;
    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentSource
    );

    // 创建着色程序，一个着色程序包含一个顶点着色器和一个片元着色器
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // 链接着色程序，从而完成为程序的片元和顶点着色器准备GPU代码的过程
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Unable to initialize the shader program');
    }

    return program;
  }
  createShader(gl, type, source) {
    // 创建一个新的着色器
    const shader = gl.createShader(type);
    // 将源代码发送给源代码
    gl.shaderSource(shader, source);
    // 着色器编译源代码
    gl.compileShader(shader);

    // 检查是否编译成功
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error(`An error occurred compiling the shaders`);
    }

    return shader;
  }
}

class Mesh {
  constructor(config) {
    this.geometry = config.geometry;
    this.shader = config.shader;
    // 模型视图矩阵
    this.modelViewMatrix = mat4.create();
  }
  render(gl, data) {
    const { shader, geometry, modelViewMatrix } = this;

    shader.init(gl);
    geometry.init(gl);

    // 设置物体的位置坐标(x, y, z)
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

    // 设置shader attributes数据
    this.setAttributes(gl);
    gl.useProgram(shader.program);
    // 设置shader uniforms数据
    this.setUniforms(gl, data);
  }
  setAttributes(gl) {
    const { shader, geometry } = this;
    const program = shader.program;
    const { attributes, buffers } = geometry;
    for (const [attr, buffer] of Object.entries(buffers)) {
      const { count } = attributes[attr];
      const location = gl.getAttribLocation(program, attr);
      // 绑定缓冲区位置
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      // 告诉显卡从当前绑定的缓冲区（bindBuffer() 指定的缓冲区）中读取顶点数据
      // 每个顶点属性的组成数量，必须是1、2、3、4
      gl.vertexAttribPointer(location, count, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(location);
    }
  }
  setUniforms(gl, data) {
    const { modelViewMatrix, shader } = this;
    const { projectionMatrix } = data;
    const program = shader.program;

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, 'uProjectionMatrix'),
      false,
      projectionMatrix
    );
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, 'uModelViewMatrix'),
      false,
      modelViewMatrix
    );
  }
}

class WebGLRenderer {
  constructor(config) {
    const { canvas } = config;
    this.canvas = config.canvas;
    const gl = canvas.getContext('webgl');
    this.gl = gl;
    if (!gl) {
      throw new Error('WebGL not supported');
    }
  }
  createProjectMatrix() {
    const canvas = this.canvas;
    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    return projectionMatrix;
  }
  preRender() {
    const gl = this.gl;
    // 设置清空颜色缓冲时的颜色值，值的范围是 0 到 1
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 设置深度缓冲区的深度清除值，值的范围是 0 到 1
    gl.clearDepth(1.0);

    /*
      开启某种特性，特性值主要有：
      - gl.BLEND：激活片元的颜色融合计算，需要后续调用blendFunc()
      - gl.CULL_FACE：激活多边形正反面剔除，需要后续调用cullFace()
      - gl.DEPTH_TEST：激活深度比较，并且更新深度缓冲区，需要后续调用depthFunc()
      - gl.SCISSOR_TEST：激活剪裁测试，即丢弃在剪裁矩形范围外的片段，需要后续调用scissor()
      - gl.STENCIL_TEST：激活模板测试并且更新模板缓冲区，需要后续调用stencilFunc()
    */
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    /*
      使用预设值来清空缓冲，值可能是：
      - gl.COLOR_BUFFER_BIT //颜色缓冲区
      - gl.DEPTH_BUFFER_BIT //深度缓冲区
      - gl.STENCIL_BUFFER_BIT //模板缓冲区
    */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
  renderScene(mesh) {
    const { gl } = this;
    // 创建投影矩阵
    const projectionMatrix = this.createProjectMatrix();

    mesh.render(gl, { projectionMatrix });

    // drawArrays表示从向量数组中绘制图元
    // 绘制一个gl.TRIANGLE_STRIP三角带，从第0个顶点开始，绘制需要用到4个点
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  render(mesh) {
    this.preRender();
    this.renderScene(mesh);
  }
}

onMounted(() => {
  const { canvas } = createAndMountCanvas();

  const renderer = new WebGLRenderer({ canvas });

  const geometry = new Geometry();
  const positions = new Float32Array([
    1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0,
  ]);
  const colors = new Float32Array([
    1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,
  ]);
  geometry.setAttribute('aPosition', new BufferAttribute(positions, 2));
  geometry.setAttribute('aColor', new BufferAttribute(colors, 3));

  const mesh = new Mesh({
    geometry,
    shader: new Shader({
      vertex: `
        precision mediump float;
        attribute vec3 aPosition;
        attribute vec3 aColor;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying vec3 vColor;
        void main() {
          vColor = aColor;
          gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
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
  renderer.render(mesh);
});
</script>
