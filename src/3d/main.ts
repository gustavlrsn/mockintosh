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
  const CRT_PHOSPHOR_TINT = "#bfe6ff";
  const CRT_TINT_STRENGTH = 1;

  // "#aeeccf" for greener phosphor
  // "#bff5df" for subtle blue-green
  // "#d8fff2" for a cooler pale cyan
  // "#cfe8ff" for a cooler blue phosphor
  // "#bfd8ff" for an icy blue phosphor
  // "#ffffff" to go back to neutral monochrome
  const crtMaterial = createCRTPhysicalMaterial({
    screenTexture: upRT.texture,
    emissiveIntensity: 1.0,
    scanlineIntensity: 0.03,
    phosphorTint: CRT_PHOSPHOR_TINT,
    tintStrength: CRT_TINT_STRENGTH,
    rasterMin: [RASTER_UV_MIN_X, RASTER_UV_MIN_Y],
    rasterMax: [RASTER_UV_MAX_X, RASTER_UV_MAX_Y],
  });

  const {
    group: macModel,
    crtMesh,
    brightnessKnob,
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

  // --- Brightness knob interaction ---
  // The knob mesh ("twist") has vertices baked in absolute model coordinates
  // (~440mm from origin) with no translation. Rotating the mesh as-is swings
  // it around the scene origin. Fix: shift the geometry so the mesh's local
  // origin is at its geometric center, then set mesh.position to compensate.
  // Now rotation acts around the knob's own center.
  const BRIGHTNESS_MIN = 0.2;
  const BRIGHTNESS_MAX = 3.0;
  let currentBrightness = 1.0;
  const KNOB_SENSITIVITY = 0.015;

  let knobDragging = false;
  let knobDragLastY = 0;

  if (brightnessKnob) {
    brightnessKnob.geometry.computeBoundingBox();
    const center = brightnessKnob.geometry.boundingBox!.getCenter(
      new THREE.Vector3()
    );
    brightnessKnob.geometry.translate(-center.x, -center.y, -center.z);
    // position is in parent space (post-quaternion), so we must rotate the
    // geometry-space center by the mesh's own quaternion to compensate.
    brightnessKnob.position
      .copy(center)
      .applyQuaternion(brightnessKnob.quaternion);

    console.log("[KNOB DEBUG] center:", center);
    console.log(
      "[KNOB DEBUG] rotated position:",
      brightnessKnob.position.clone()
    );
    console.log(
      "[KNOB DEBUG] world position:",
      brightnessKnob.getWorldPosition(new THREE.Vector3())
    );
  }

  const knobBaseQuat = brightnessKnob
    ? brightnessKnob.quaternion.clone()
    : new THREE.Quaternion();

  function setBrightness(val: number) {
    currentBrightness = Math.max(BRIGHTNESS_MIN, Math.min(BRIGHTNESS_MAX, val));
    console.log("[KNOB] brightness:", currentBrightness.toFixed(2));
    const shader = (crtMaterial as CRTPhysicalMaterial).__crtShader;
    if (shader) {
      shader.uniforms.uCrtEmissiveIntensity.value = currentBrightness;
    }
    if (brightnessKnob) {
      const t =
        (currentBrightness - BRIGHTNESS_MIN) /
        (BRIGHTNESS_MAX - BRIGHTNESS_MIN);
      // Spin ~270° across the full range; local Y is the cylindrical axis
      const angle = t * Math.PI * 1.5;
      const spinQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        angle
      );
      brightnessKnob.quaternion.copy(knobBaseQuat).multiply(spinQuat);
    }
  }

  // Initialize knob visual rotation
  setBrightness(currentBrightness);

  if (brightnessKnob) {
    console.log(
      "[KNOB DEBUG] after setBrightness world position:",
      brightnessKnob.getWorldPosition(new THREE.Vector3())
    );
  }

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

  function updatePointerNDC(event: { clientX: number; clientY: number }) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function hitsKnob(): boolean {
    if (!brightnessKnob) return false;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(brightnessKnob).length > 0;
  }

  // --- Knob drag ---
  renderer.domElement.addEventListener("pointerdown", (event) => {
    updatePointerNDC(event);
    if (hitsKnob()) {
      knobDragging = true;
      knobDragLastY = event.clientY;
      controls.enabled = false;
      renderer.domElement.setPointerCapture(event.pointerId);
      event.preventDefault();
    }
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (knobDragging) {
      const dy = knobDragLastY - event.clientY;
      knobDragLastY = event.clientY;
      setBrightness(currentBrightness + dy * KNOB_SENSITIVITY);
      renderer.domElement.style.cursor = "ns-resize";
      return;
    }
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    if (knobDragging) {
      knobDragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    }
  });

  // --- Screen interaction ---
  function onScreenPointerEvent(event: PointerEvent) {
    if (knobDragging) return;
    updatePointerNDC(event);

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

  renderer.domElement.addEventListener("pointermove", onScreenPointerEvent);
  renderer.domElement.addEventListener("pointerdown", onScreenPointerEvent);
  renderer.domElement.addEventListener("pointerup", onScreenPointerEvent);

  renderer.domElement.addEventListener("dblclick", (event) => {
    updatePointerNDC(event);

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(crtMesh);

    if (hits.length > 0 && hits[0].uv) {
      const coords = mapCRTUVToCanvas(hits[0].uv.x, hits[0].uv.y);
      if (coords) {
        dispatchToOSCanvas(os.canvas, "dblclick", coords.x, coords.y);
      }
    }
  });

  // --- Cursor + orbit control toggle ---
  let pointerOverScreen = false;
  renderer.domElement.addEventListener("pointermove", (event) => {
    if (knobDragging) return;
    updatePointerNDC(event);

    raycaster.setFromCamera(pointer, camera);

    // Check knob hover
    const overKnob = hitsKnob();

    // Check screen hover
    const screenHits = raycaster.intersectObject(crtMesh);
    const onRaster =
      screenHits.length > 0 &&
      !!screenHits[0].uv &&
      !!mapCRTUVToCanvas(screenHits[0].uv.x, screenHits[0].uv.y);
    pointerOverScreen = onRaster;

    controls.enabled = !pointerOverScreen && !overKnob;
    renderer.domElement.style.cursor = pointerOverScreen
      ? "none"
      : overKnob
      ? "ns-resize"
      : "";
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
