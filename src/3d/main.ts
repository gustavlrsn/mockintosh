import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  loadMacPlusModel,
  RASTER_UV_MIN_X,
  RASTER_UV_MAX_X,
  RASTER_UV_MIN_Y,
  RASTER_UV_MAX_Y,
} from "./MacPlusModel";
import { createCRTPhysicalMaterial } from "./screenShader";
import type { CRTPhysicalMaterial } from "./screenShader";
import { bootOS, mapCRTUVToCanvas, dispatchToOSCanvas } from "./osBridge";

async function init() {
  const container = document.getElementById("three-root")!;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.5, 6);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.3, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 12;
  controls.update();

  // --- Lighting ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  const keyLight = new THREE.PointLight(0xffe8c0, 25, 30);
  keyLight.position.set(3, 4, 4);
  scene.add(keyLight);

  const backLight = new THREE.PointLight(0xffffff, 8, 20);
  backLight.position.set(0, 2, -4);
  scene.add(backLight);

  // --- Boot OS ---
  const os = await bootOS();

  const screenTexture = new THREE.CanvasTexture(os.canvas);
  screenTexture.minFilter = THREE.NearestFilter;
  screenTexture.magFilter = THREE.NearestFilter;

  // GPU-upscaled texture: renders the OS canvas onto a larger render target
  // with NearestFilter (crisp integer-scale), then the render target texture
  // uses LinearFilter to eliminate moiré while keeping pixels crisp.
  const UPSCALE = 2;
  const upRT = new THREE.WebGLRenderTarget(
    os.canvas.width * UPSCALE,
    os.canvas.height * UPSCALE,
    { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
  );

  const upScene = new THREE.Scene();
  const upCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const upQuad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ map: screenTexture })
  );
  upScene.add(upQuad);

  function updateUpscaledTexture() {
    screenTexture.needsUpdate = true;
    renderer.setRenderTarget(upRT);
    renderer.render(upScene, upCamera);
    renderer.setRenderTarget(null);
  }

  // --- CRT material ---
  const crtMaterial = createCRTPhysicalMaterial({
    screenTexture: upRT.texture,
    emissiveIntensity: 1.5,
    scanlineIntensity: 0.03,
    rasterMin: [RASTER_UV_MIN_X, RASTER_UV_MIN_Y],
    rasterMax: [RASTER_UV_MAX_X, RASTER_UV_MAX_Y],
  });

  const {
    group: macModel,
    crtMesh,
    screenOffMaterial,
  } = await loadMacPlusModel(crtMaterial);
  macModel.position.y = -1.5;
  macModel.position.x = 3.5;
  macModel.position.z = 0;
  scene.add(macModel);

  let screenOn = true;
  function setScreenPower(on: boolean) {
    screenOn = on;
    crtMesh.material = on ? crtMaterial : screenOffMaterial;
  }

  const powerBtn = document.getElementById("power-btn")!;
  powerBtn.addEventListener("click", () => {
    screenOn = !screenOn;
    setScreenPower(screenOn);
    powerBtn.classList.toggle("off", !screenOn);
  });

  const brightnessSlider = document.getElementById(
    "brightness"
  )! as HTMLInputElement;
  brightnessSlider.addEventListener("input", () => {
    const val = parseFloat(brightnessSlider.value);
    const shader = (crtMaterial as CRTPhysicalMaterial).__crtShader;
    if (shader) {
      shader.uniforms.uCrtEmissiveIntensity.value = val;
    }
  });

  // --- Floor ---
  const floorGeo = new THREE.PlaneGeometry(20, 20);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.9,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.95;
  scene.add(floor);

  // --- Mouse interaction ---
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onPointerEvent(event: PointerEvent) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(crtMesh);

    if (hits.length > 0 && hits[0].uv) {
      const coords = mapCRTUVToCanvas(hits[0].uv.x, hits[0].uv.y);
      if (!coords) return;

      const typeMap: Record<string, string> = {
        pointermove: "mousemove",
        pointerdown: "mousedown",
        pointerup: "mouseup",
      };
      const mouseType = typeMap[event.type];
      if (mouseType) {
        dispatchToOSCanvas(os.canvas, mouseType, coords.x, coords.y);
      }
    }
  }

  renderer.domElement.addEventListener("pointermove", onPointerEvent);
  renderer.domElement.addEventListener("pointerdown", onPointerEvent);
  renderer.domElement.addEventListener("pointerup", onPointerEvent);

  renderer.domElement.addEventListener("dblclick", (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(crtMesh);

    if (hits.length > 0 && hits[0].uv) {
      const coords = mapCRTUVToCanvas(hits[0].uv.x, hits[0].uv.y);
      if (coords) {
        dispatchToOSCanvas(os.canvas, "dblclick", coords.x, coords.y);
      }
    }
  });

  let pointerOverScreen = false;
  renderer.domElement.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(crtMesh);
    const onRaster =
      hits.length > 0 &&
      !!hits[0].uv &&
      !!mapCRTUVToCanvas(hits[0].uv.x, hits[0].uv.y);
    pointerOverScreen = onRaster;
    controls.enabled = !pointerOverScreen;
    renderer.domElement.style.cursor = pointerOverScreen ? "none" : "";
  });

  // --- Resize ---
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- FPS counter ---
  const fpsEl = document.createElement("div");
  fpsEl.style.cssText =
    "position:fixed;bottom:16px;left:16px;color:#8f8;font:12px/1 monospace;" +
    "background:rgba(0,0,0,0.6);padding:4px 8px;border-radius:4px;z-index:10;";
  document.body.appendChild(fpsEl);
  let fpsFrames = 0;
  let fpsLastTime = performance.now();

  // --- Animate ---
  function animate() {
    requestAnimationFrame(animate);
    if (screenOn) {
      updateUpscaledTexture();
    }
    controls.update();
    renderer.render(scene, camera);

    fpsFrames++;
    const now = performance.now();
    if (now - fpsLastTime >= 1000) {
      fpsEl.textContent = `${fpsFrames} fps`;
      fpsFrames = 0;
      fpsLastTime = now;
    }
  }

  animate();
}

init();
