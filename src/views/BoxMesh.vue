<template>
  <div ref="boxElementRef" class="box"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
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

class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Object3D {
  constructor() {
    this.position = new Vector3();
    this.rotation = 0.0;
    this.rotationAxis = new Vector3(0, 0, 1);
    // 模型视图矩阵
    this.modelViewMatrix = mat4.create();
  }
  rotateX(rotation) {
    this.rotation = rotation;
    this.rotationAxis = new Vector3(1, 0, 0);
  }
  rotateY(rotation) {
    this.rotation = rotation;
    this.rotationAxis = new Vector3(0, 1, 0);
  }
  rotateZ(rotation) {
    this.rotation = rotation;
    this.rotationAxis = new Vector3(0, 0, 1);
  }
  updateModelViewMatrix() {
    const { position, rotation, rotationAxis } = this;
    // 模型视图矩阵
    const modelViewMatrix = mat4.create();
    // 设置物体的位置坐标
    mat4.translate(modelViewMatrix, modelViewMatrix, [
      position.x,
      position.y,
      position.z,
    ]);
    // 设置物体旋转
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [
      rotationAxis.x,
      rotationAxis.y,
      rotationAxis.z,
    ]);
    this.modelViewMatrix = modelViewMatrix;
  }
}

class BufferAttribute {
  constructor(data, count) {
    this.data = data;
    this.count = count;
  }
}

class Geometry {
  constructor() {
    this.attributes = {};
    this.vertexCount = 0;
  }
  setAttribute(attr, value) {
    if (!['aPosition', 'aColor'].includes(attr)) {
      throw new Error('An error occurred setAttribute');
    }
    this.attributes[attr] = value;
  }
  setIndex(indices) {
    this.indices = indices;
    this.vertexCount = indices.length;
  }
  init(gl) {
    const attributes = this.attributes;
    const buffers = {};
    const ARRAY_BUFFER = gl.ARRAY_BUFFER;
    let vertexCount = 0;
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'aPosition') {
        vertexCount = value.data.length / value.count;
      }
      buffers[key] = this.createBuffer(gl, ARRAY_BUFFER, value.data);
    }

    const indices = this.indices;
    const isExistIndex = Array.isArray(indices) && indices.length;
    if (isExistIndex) {
      this.indexBuffer = this.createBuffer(
        gl,
        gl.ELEMENT_ARRAY_BUFFER,
        indices
      );
    }
    this.buffers = buffers;
    this.vertexCount = isExistIndex ? indices.length : vertexCount;
  }
  createBuffer(gl, type, data) {
    // 创建WebGL缓冲对象
    const buffer = gl.createBuffer();
    /*
      将缓冲对象绑定到对应的目标
      - gl.ARRAY_BUFFER: 包含顶点属性的 Buffer，如顶点坐标，纹理坐标数据或顶点颜色数据
      - gl.ELEMENT_ARRAY_BUFFER: 用于元素索引的 Buffer
    */
    gl.bindBuffer(type, buffer);
    // 创建并初始化缓冲对象的数据存储区
    gl.bufferData(type, data, gl.STATIC_DRAW);
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

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    gl.deleteProgram(program);
    throw new Error('Unable to initialize the shader program');
  }
  createShader(gl, type, source) {
    // 创建一个新的着色器
    const shader = gl.createShader(type);
    // 将源代码发送给源代码
    gl.shaderSource(shader, source);
    // 着色器编译源代码
    gl.compileShader(shader);

    // 检查是否编译成功
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    gl.deleteShader(shader);
    throw new Error(`An error occurred compiling the shaders`);
  }
}

class Mesh extends Object3D {
  constructor(config) {
    super();
    this.geometry = config.geometry;
    this.shader = config.shader;
    this.isDrawElements = !!this.geometry.indexBuffer;
  }
  init(gl) {
    const { shader, geometry } = this;
    shader.init(gl);
    geometry.init(gl);

    const attributeInfo = {};
    const program = shader.program;
    const { buffers, attributes } = geometry;
    for (const [attr, buffer] of Object.entries(buffers)) {
      const { count } = attributes[attr];
      const location = gl.getAttribLocation(program, attr);
      attributeInfo[attr] = {
        count,
        buffer,
        location,
      };
    }
    this.programInfo = {
      attributeInfo,
      uniformInfo: {
        uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
        uModelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
      },
    };
  }
  render(gl, data) {
    gl.useProgram(this.shader.program);
    // 设置shader attributes数据
    this.updateAttributes(gl);
    // 设置shader uniforms数据
    this.updateUniforms(gl, data);
  }
  updateAttributes(gl) {
    const geometry = this.geometry;
    const { attributeInfo } = this.programInfo;
    for (const value of Object.values(attributeInfo)) {
      const { count, location, buffer } = value;
      // 绑定缓冲区位置
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      // 告诉显卡从当前绑定的缓冲区（bindBuffer() 指定的缓冲区）中读取顶点数据
      // 每个顶点属性的组成数量，必须是1、2、3、4
      gl.vertexAttribPointer(location, count, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(location);
    }
    const indexBuffer = geometry.indexBuffer;
    if (indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    }
  }
  updateUniforms(gl, data) {
    const { uniformInfo } = this.programInfo;
    const { projectionMatrix } = data;
    const modelViewMatrix = this.modelViewMatrix;

    gl.uniformMatrix4fv(uniformInfo.uProjectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(uniformInfo.uModelViewMatrix, false, modelViewMatrix);
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
    this.projectionMatrix = this.createProjectMatrix();
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
  drawElements(vertexCount) {
    const gl = this.gl;
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
  }
  drawArrays(vertexCount) {
    const gl = this.gl;
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
  renderStart() {
    const { gl, canvas } = this;
    gl.viewport(0, 0, canvas.width, canvas.height);
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
    const { gl, projectionMatrix } = this;
    mesh.render(gl, { projectionMatrix });
    const vertexCount = mesh.geometry.vertexCount;
    mesh.isDrawElements
      ? this.drawElements(vertexCount)
      : this.drawArrays(vertexCount);
  }
  render(mesh) {
    this.renderStart();
    this.renderScene(mesh);
  }
}

const createBox = (gl) => {
  const geometry = new Geometry();
  // 每3个顶点构成一个三角形，正方体有6个面，1个面需要6个顶点从而组成两个三角形
  // 这种方式存在很多冗余数据，推荐使用顶点索引实现
  const positions = new Float32Array([
    // 正面
    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
    1.0, -1.0, -1.0, 1.0,

    // 背面
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0,
    1.0, -1.0, -1.0, -1.0, -1.0,

    // 顶部
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0, -1.0,

    // 底部
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    -1.0, 1.0, -1.0, -1.0, -1.0,

    // 右侧
    1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
    1.0, 1.0, -1.0, -1.0,

    // 左侧
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0,
    1.0, -1.0, -1.0, -1.0, -1.0,
  ]);
  const colorArray = [];
  const count = positions.length;
  for (let index = 0; index < count; index++) {
    const value = Number(Math.random().toPrecision(1));
    colorArray.push(value);
  }
  const colors = new Float32Array(colorArray);
  geometry.setAttribute('aPosition', new BufferAttribute(positions, 3));
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

  mesh.init(gl);

  return mesh;
};

onMounted(() => {
  let raf = null;
  const { canvas } = createAndMountCanvas();
  const renderer = new WebGLRenderer({ canvas });
  const mesh = createBox(renderer.gl);
  mesh.position.set(0.0, 0.0, -6);

  const animate = () => {
    mesh.rotateY(mesh.rotation + 0.01);
    mesh.updateModelViewMatrix();
    renderer.render(mesh);
    raf = window.requestAnimationFrame(animate);
  };

  animate();

  onBeforeUnmount(() => window.cancelAnimationFrame(raf));
});
</script>
