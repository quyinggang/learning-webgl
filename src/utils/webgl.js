import { mat4 } from 'gl-matrix';
import { toRadian, isPowerOf2 } from './index';

const alias = {
  texture: 'texture',
  cubeTexture: 'cubeTexture',
  f3v: 'f3v',
  normal: 'normalMatrix',
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

class Vector4 {
  constructor(x = 0, y = 0, z = 0, w = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
  toArray() {
    const { x, y, z, w } = this;
    return [x, y, z, w];
  }
}

class BufferAttribute {
  constructor(data, count) {
    this.data = data;
    this.count = count;
  }
}

class Object3D {
  constructor() {
    this.position = new Vector3();
    this.rotation = new Vector3();
    this.scale = new Vector3(1, 1, 1);
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
    const { position, rotation, scale } = this;
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
    mat4.translate(modelMatrix, modelMatrix, position.toArray());
    for (const value of rotationList) {
      // 设置物体旋转
      mat4.rotate(modelMatrix, modelMatrix, value.rotation, value.axis);
    }
    mat4.scale(modelMatrix, modelMatrix, scale.toArray());
    this.modelMatrix = modelMatrix;
  }
}

class Camera {
  constructor(config) {
    this.fov = toRadian(config.fov);
    this.aspect = config.aspect;
    this.near = config.near;
    this.far = config.far;
    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.position = new Vector3();
    this.lookAtTarget = new Vector3();
    this.up = new Vector3(0, 1, 0);
  }
  lookAt(x, y, z) {
    this.lookAtTarget.set(x, y, z);
  }
  computeViewMatrix() {
    const { position, lookAtTarget, up } = this;
    const viewMatrix = mat4.create();
    mat4.lookAt(
      viewMatrix,
      position.toArray(),
      lookAtTarget.toArray(),
      up.toArray()
    );
    this.viewMatrix = viewMatrix;
  }
}

class PerspectiveCamera extends Camera {
  constructor(config) {
    super(config);
    this.projectionMatrix = this.computeProjectionMatrix();
  }
  computeProjectionMatrix() {
    const { fov, aspect, near, far } = this;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fov, aspect, near, far);
    return projectionMatrix;
  }
}

class Geometry {
  constructor() {
    this.attributes = {};
    this.vertexCount = 0;
  }
  setAttribute(attr, value) {
    if (!['aPosition', 'aColor', 'aUV', 'aNormal'].includes(attr)) {
      throw new Error('An error occurred setAttribute');
    }
    this.attributes[attr] = value;
  }
  setIndex(indices) {
    this.indices = indices;
  }
  init(gl, program) {
    this.processBuffers(gl);
    this.processVertexAttrib(gl, program);
  }
  processBuffers(gl) {
    const attributes = this.attributes || {};
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

    const indices = this.indices;
    const isExistIndex = indices && indices.length > 0;
    if (isExistIndex) {
      this.indexBuffer = this.createBuffer(
        gl,
        gl.ELEMENT_ARRAY_BUFFER,
        indices
      );
    }
    this.vertexCount = isExistIndex ? indices.length : vertexCount;
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
    this.resources = config.resources;
    this.processStencil(config.stencil);
  }
  init(gl) {
    this.program = this.createProgram(gl);
    this.processResources(gl);
  }
  processStencil(stencil) {
    if (!stencil) return;
    const { stencilFunc, stencilMask, stencilRef, stencilPass } = stencil;
    this.stencil = {
      stencilFunc,
      stencilMask,
      stencilRef,
      stencilPass,
    };
  }
  processResources(gl) {
    const { program, resources = {} } = this;
    const customUniforms = {};
    const callbackMap = {
      [alias.texture]: (value) => {
        const result = {};
        const isVideoSource = value instanceof HTMLVideoElement;
        const texture = this.createTexture(gl, value);
        result.value = texture;
        if (isVideoSource) {
          result.video = value;
        }
        return result;
      },
      [alias.cubeTexture]: (value) => {
        const result = {};
        const texture = this.createCubeTexture(gl, value);
        result.value = texture;
        return result;
      },
    };
    for (const [attr, data] of Object.entries(resources)) {
      const resourceValue = data.value;
      const location = gl.getUniformLocation(program, attr);
      const defaultResult = { location, type: data.type, value: resourceValue };
      const callback = callbackMap[data.type];
      const result = callback ? callback(resourceValue) : {};
      customUniforms[attr] = {
        ...defaultResult,
        ...result,
      };
    }
    this.uniformsInfo = customUniforms;
  }
  createTexture(gl, source) {
    // 创建WebGL纹理对象
    const texture = gl.createTexture();
    // 绑定给定的纹理到目标
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 指定纹理的数据源
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    const isVideoSource = source instanceof HTMLVideoElement;
    // 对于宽高两个维度上是否为2的幂来设置纹理的过滤（filter）和平铺（wrap）
    const isPower2Image = isPowerOf2(source.width) && isPowerOf2(source.height);
    // 视频纹理不能生成Mipmap
    if (isPower2Image && !isVideoSource) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    return texture;
  }
  createCubeTexture(gl, sources) {
    // 创建WebGL纹理对象
    const texture = gl.createTexture();
    // 绑定给定的纹理到目标
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    // 上下左右前后顺序
    const types = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    ];
    for (let index = 0, len = types.length; index < len; index++) {
      const type = types[index];
      const source = sources[index];
      gl.texImage2D(type, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }
  updateVideoTexture(gl, texture, video) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
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
    this.isDrawElements = !!geometry.indexBuffer;
  }
  render(gl, data) {
    this.computeModelMatrix();
    gl.useProgram(this.shader.program);
    // 设置shader attributes数据
    this.updateAttributes(gl);
    this.updateUniforms(gl, data);
  }
  computeNormalMatrix(viewMatrix) {
    const modelMatrix = this.modelMatrix;
    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

    // 法向量矩阵就是模型视图矩阵的逆矩阵的转置矩阵
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    return normalMatrix;
  }
  updateAttributes(gl) {
    const { vertexAttributesInfo, indexBuffer } = this.geometry;
    for (const value of Object.values(vertexAttributesInfo)) {
      const { count, location, buffer } = value;
      // 绑定缓冲区位置
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      // 告诉显卡从当前绑定的缓冲区（bindBuffer() 指定的缓冲区）中读取顶点数据
      // 每个顶点属性的组成数量，必须是1、2、3、4
      gl.vertexAttribPointer(location, count, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(location);
    }

    if (indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    }
  }
  updateUniforms(gl, data) {
    const { modelMatrix, defaultUniforms, shader } = this;
    const { viewMatrix, projectionMatrix } = data;
    const uniformsInfo = shader.uniformsInfo;
    let textureIndex = 0;

    gl.uniformMatrix4fv(defaultUniforms.uModelMatrix, false, modelMatrix);
    gl.uniformMatrix4fv(defaultUniforms.uViewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(
      defaultUniforms.uProjectionMatrix,
      false,
      projectionMatrix
    );

    const callbackMap = {
      [alias.texture]: (item) => {
        // 应用多个纹理时需要设置不同的纹理单元
        gl.activeTexture(gl.TEXTURE0 + textureIndex);
        gl.bindTexture(gl.TEXTURE_2D, item.value);
        gl.uniform1i(item.location, textureIndex);
        textureIndex += 1;

        // 视频作为纹理来源需要在每一帧动态更新纹理内容才能实现播放
        if (item.video) {
          shader.updateVideoTexture(gl, item.value, item.video);
        }
      },
      [alias.normal]: (item) => {
        const normalMatrix = this.computeNormalMatrix(viewMatrix);
        gl.uniformMatrix4fv(item.location, false, normalMatrix);
      },
      [alias.f3v]: (item) => {
        const value = item.value;
        gl.uniform3fv(item.location, value);
      },
      [alias.cubeTexture]: (item) => {
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(item.location, 0);
      },
    };

    const valueList = Object.values(uniformsInfo);
    if (Array.isArray(valueList) && valueList.length > 0) {
      for (const item of valueList) {
        const callback = callbackMap[item.type];
        callback && callback(item);
      }
    }
  }
}

class WebGLRenderer {
  constructor(config) {
    const { canvas, autoClear = true, antialias = true } = config;
    this.canvas = config.canvas;
    this.autoClear = !!autoClear;
    const gl = canvas.getContext('webgl', { antialias: !!antialias });
    this.gl = gl;
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    this.scissor = null;
    this.depthTest = true;
  }
  drawElements(vertexCount) {
    const gl = this.gl;
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
  }
  drawArrays(vertexCount) {
    const gl = this.gl;
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
  setScissor(x, y, width, height) {
    this.scissor = new Vector4(x, y, width, height);
  }
  setDepthTestVisible(value) {
    this.depthTest = !!value;
  }
  clear() {
    const { gl, canvas, scissor, depthTest } = this;
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
    // 开启裁剪测试
    if (scissor) {
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(scissor.x, scissor.y, scissor.z, scissor.w);
    } else {
      gl.disable(gl.SCISSOR_TEST);
    }

    // 开启深度测试
    depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);

    /*
      使用预设值来清空缓冲，值可能是：
      - gl.COLOR_BUFFER_BIT //颜色缓冲区
      - gl.DEPTH_BUFFER_BIT //深度缓冲区
      - gl.STENCIL_BUFFER_BIT //模板缓冲区
    */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  }
  startStencilTest(config) {
    if (!config) return;
    const { gl, depthTest } = this;
    gl.enable(gl.STENCIL_TEST);
    gl.enable(gl.DEPTH_TEST);
    // 保证深度测试成功总是通过
    gl.depthFunc(gl.ALWAYS);
    // 模板测试
    // 是否写入模版缓存值
    // gl.stencilMask(config.stencilMask);
    // 测试通过后使用stencilRef替换模板值
    gl.stencilFunc(config.stencilFunc, config.stencilRef, 0xff);
    // 设置模板、深度测试通过失败、通过、都通过时分别采取的动作
    // gl.REPLACE表示使用测试条件中的设定值来代替当前模板值，stencilFunc方法中的ref参数
    gl.stencilOp(gl.KEEP, gl.KEEP, config.stencilPass);
    depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
  }
  renderScene(data, camera) {
    const { gl } = this;
    const { viewMatrix, projectionMatrix } = camera;

    const list = Array.isArray(data) ? data : [data];
    for (const mesh of list) {
      mesh.render(gl, { viewMatrix, projectionMatrix });
      const vertexCount = mesh.geometry.vertexCount;
      // 处理每个mesh的模板缓存逻辑
      this.startStencilTest(mesh.shader.stencil);
      mesh.isDrawElements
        ? this.drawElements(vertexCount)
        : this.drawArrays(vertexCount);
    }
  }
  render(data, camera) {
    this.autoClear && this.clear();
    this.renderScene(data, camera);
  }
}

export {
  PerspectiveCamera,
  BufferAttribute,
  Mesh,
  Shader,
  Geometry,
  WebGLRenderer,
  Object3D,
};
