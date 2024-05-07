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
  toArray() {
    const { x, y, z } = this;
    return [x, y, z];
  }
}

class Object3D {
  constructor() {
    this.position = new Vector3();
    this.rotation = new Vector3();
    // 模型矩阵
    this.modelMatrix = mat4.create();
  }
  rotateX(rotation) {
    this.rotation.x = rotation;
  }
  rotateY(rotation) {
    this.rotation.y = rotation;
  }
  rotateZ(rotation) {
    this.rotation.z = rotation;
  }
  computeModelMatrix() {
    const { position, rotation } = this;
    const rotationList = [
      {
        axis: [1, 0, 0],
        rotation: rotation.x,
      },
      {
        axis: [0, 1, 0],
        rotation: rotation.y,
      },
      {
        axis: [0, 0, 1],
        rotation: rotation.z,
      },
    ];
    /**
     * 模型矩阵是在3D图形渲染中用来描述模型位置、旋转和缩放的矩阵
     * 在WebGL中，使用模型矩阵可以将模型从模型坐标系（局部坐标系）转换到世界坐标系中
     */
    const modelMatrix = mat4.create();
    // 设置物体的位置坐标
    mat4.translate(modelMatrix, modelMatrix, [
      position.x,
      position.y,
      position.z,
    ]);
    for (const value of rotationList) {
      // 设置物体旋转
      mat4.rotate(modelMatrix, modelMatrix, value.rotation, value.axis);
    }
    this.modelMatrix = modelMatrix;
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
    if (!['aPosition'].includes(attr)) {
      throw new Error('An error occurred setAttribute');
    }
    this.attributes[attr] = value;
  }
  setIndex(indices) {
    this.indices = indices;
    this.vertexCount = indices.length;
  }
  init(gl, program) {
    this.processBuffers(gl);
    this.processVertexAttrib(gl, program);
  }
  processBuffers(gl) {
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
    this.buffers = buffers;
    this.vertexCount = vertexCount;
  }
  processVertexAttrib(gl, program) {
    const { buffers, attributes } = this;
    const attributeInfo = {};
    for (const [attr, buffer] of Object.entries(buffers)) {
      const { count } = attributes[attr];
      const location = gl.getAttribLocation(program, attr);
      attributeInfo[attr] = {
        count,
        buffer,
        location,
      };
    }
    this.vertexAttributesInfo = attributeInfo;
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
    this.program = this.createProgram(gl);
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
  }
  init(gl) {
    const { shader, geometry } = this;
    shader.init(gl);
    geometry.init(gl, shader.program);

    const program = shader.program;
    this.defaultUniforms = {
      uModelMatrix: gl.getUniformLocation(program, 'uModelMatrix'),
      uViewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
      uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
    };
  }
  render(gl, data) {
    this.computeModelMatrix();
    gl.useProgram(this.shader.program);
    // 设置shader attributes数据
    this.updateAttributes(gl);
    this.updateUniforms(gl, data);
  }
  updateAttributes(gl) {
    const { vertexAttributesInfo } = this.geometry;
    for (const value of Object.values(vertexAttributesInfo)) {
      const { count, location, buffer } = value;
      // 绑定缓冲区位置
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      // 告诉显卡从当前绑定的缓冲区（bindBuffer() 指定的缓冲区）中读取顶点数据
      // 每个顶点属性的组成数量，必须是1、2、3、4
      gl.vertexAttribPointer(location, count, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(location);
    }
  }
  updateUniforms(gl, data) {
    const modelMatrix = this.modelMatrix;
    const defaultUniforms = this.defaultUniforms;
    const { viewMatrix, projectionMatrix } = data;

    gl.uniformMatrix4fv(defaultUniforms.uModelMatrix, false, modelMatrix);
    gl.uniformMatrix4fv(defaultUniforms.uViewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(
      defaultUniforms.uProjectionMatrix,
      false,
      projectionMatrix
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
    this.viewMatrix = mat4.create();
    this.projectionMatrix = this.createProjectMatrix();
  }
  setViewMatrix(eye, center, up) {
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, eye, center, up);
    this.viewMatrix = viewMatrix;
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
    const { gl, viewMatrix, projectionMatrix } = this;
    mesh.render(gl, { viewMatrix, projectionMatrix });
    this.drawArrays(mesh.geometry.vertexCount);
  }
  render(mesh) {
    this.renderStart();
    this.renderScene(mesh);
  }
}

const createMesh = (gl) => {
  const geometry = new Geometry();
  /*
    模型坐标 -> 世界坐标 -> 视觉空间坐标 -> 裁剪空间坐标 -> NDC坐标 -> 屏幕坐标
    - 模型坐标系是以物体模型中心为原点的，以webgl坐标系的右手坐标系为依据建立的虚拟坐标系
    - 世界坐标是世界坐标系下的坐标表示，webgl下的世界坐标系是一个三维的坐标系，它用于定义场景内所有对象的位置和方向
      - 它是右手坐标系：坐标系原点位于视口中心，x轴正方向向右，y轴正方向向上，z轴正方向从屏幕向外
      - WebGL的世界坐标系的取值范围通常被限制在(-1, -1, -1)到(1, 1, 1)之间
    - 视图空间也叫做摄像机空间，它是以摄像机的角度来定义一个空间的，该空间使用摄像机坐标系来描述
    - 裁剪空间是一个特殊坐标空间，它是一个中心点位于 (0, 0, 0)，角落范围在 (-1, -1, -1) 到 (1, 1, 1) 之间，2 个单位宽的立方体
  */
  const positions = new Float32Array([0, 0, 0, 10, 18, 0]);
  geometry.setAttribute('aPosition', new BufferAttribute(positions, 2));

  // 应用MVP矩阵，首先将模型坐标转换成裁剪空间坐标
  // 模型坐标可以自由定义大小，不必局限于-1.0 ~ 1.0
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
        void main() {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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
  mesh.position.set(0, 0, -30.0);

  const eye = [0, 0, -80];
  const target = mesh.position.toArray();
  const up = [0, 1, 0];
  renderer.setViewMatrix(eye, target, up);

  const animate = () => {
    mesh.rotateY(mesh.rotation.y + 0.01);
    renderer.render(mesh);
    raf = window.requestAnimationFrame(animate);
  };

  animate();

  onBeforeUnmount(() => window.cancelAnimationFrame(raf));
});
</script>
