import { useEffect, useRef } from "react";
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";

function App() {
  const containerRef = useRef<any>();

  useEffect(() => {
    const currentDom = containerRef.current;

    /**
     * 初始化场景
     */
    const scene = new THREE.Scene();

    /**
     * 初始化摄像机
     */
    const camera = new THREE.PerspectiveCamera(
      30,
      currentDom.clientWidth / currentDom.clientHeight,
      0.1,
      1000
    );
    camera.position.set(-10, -90, 130);

    /**
     * 初始化渲染器
     */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentDom.clientWidth, currentDom.clientHeight);
    // 防止开发时重复渲染
    if (currentDom.childNodes[0]) {
      currentDom.removeChild(currentDom.childNodes[0]);
    }
    currentDom.appendChild(renderer.domElement);

    /**
     * 初始化模型（地图模型绘制的逻辑将在这里替换）
     */
    // const geometry = new THREE.BoxGeometry(1, 2, 3);
    // const material = new THREE.MeshBasicMaterial({ color: "#fff" });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    /**
     * HDR环境光
     */
    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    const exrLoader = new EXRLoader();
    exrLoader
      .setDataType(THREE.HalfFloatType)
      .load(`${process.env.PUBLIC_URL}/models/login.EXR`, (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap; // 给场景添加环境光效果
        scene.background = envMap; // 给场景添加背景图

        pmremGenerator.dispose();
      });

    // const rgbeLoader = new RGBELoader();
    // rgbeLoader
    //   .setDataType(THREE.HalfFloatType)
    //   .load(`${process.env.PUBLIC_URL}/models/demo3.hdr`, (texture) => {
    //     const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    //     scene.environment = envMap; // 给场景添加环境光效果
    //     scene.background = envMap; // 给场景添加背景图

    //     pmremGenerator.dispose();
    //   });

    /**
     * Models
     * coneUncompression.glb 是压缩过的模型，需要用dracoLoader加载
     * cone.glb 是未压缩，用 gltfLoader 加载即可
     */

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`${process.env.PUBLIC_URL}/draco/`);
    loader.setDRACOLoader(dracoLoader);
    loader.load(`${process.env.PUBLIC_URL}/models/login.glb`, (glb) => {
      scene.add(glb.scene);
    });

    /**
     * 初始化 CameraHelper
     */
    const helper = new THREE.CameraHelper(camera);
    scene.add(helper);

    /**
     * 初始化 AxesHelper
     */
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    /**
     * 新增光源
     */
    // const light = new THREE.PointLight(0xffffff, 20);
    // // light.position.set(0, -5, 30);
    // // light.position.set(0, -5, 10);
    // scene.add(light);
    // const ambientLight = new THREE.AmbientLight(0xffffff, 100);
    // scene.add(ambientLight);

    // 光源辅助线
    // const lightHelper = new THREE.PointLightHelper(light);
    // scene.add(lightHelper);

    /**
     * 初始化控制器
     */
    new OrbitControls(camera, renderer.domElement);

    // 视窗伸缩
    function onResize() {
      // 更新摄像头
      camera.aspect = currentDom.clientWidth / currentDom.clientHeight;
      // 更新摄像机的投影矩阵
      camera.updateProjectionMatrix();
      // 更新渲染器
      renderer.setSize(currentDom.clientWidth, currentDom.clientHeight);
      // 设置渲染器的像素比例
      renderer.setPixelRatio(window.devicePixelRatio);
    }

    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener("resize", onResize, false);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}></div>
  );
}

export default App;
