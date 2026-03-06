import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Loads the Macintosh Plus GLB model and replaces the "screen" mesh's
 * material with our CRT shader so the OS raster renders onto it.
 *
 * The "screen_glass" mesh sits in front of the screen as a transparent
 * glass overlay providing clearcoat reflections. This mirrors the real
 * hardware: the phosphor is on the flat inner surface and the curved
 * glass sits in front.
 *
 * The GLB is expected to contain a mesh named "screen" with UVs that
 * span [0,1] over the screen surface. The OS raster occupies a
 * sub-rectangle of that UV space defined by the RASTER_UV_* constants.
 */

const MODEL_PATH = "/mac-simple.glb";

/**
 * The GLB was authored in mm. We scale it so the overall model is
 * roughly the same size as the previous procedural one (~3.4 Three.js
 * units tall = 13.6 inches * 0.25). The model's case height is ~345 mm,
 * so the scale factor is 3.4 / 345 ≈ 0.00986. We'll use 0.01 and
 * fine-tune if needed.
 */
const GLB_SCALE = 0.01;

/**
 * UV-space bounds of the OS raster within the screen mesh.
 *
 * The screen mesh is ~193mm wide x ~152mm tall.
 * The OS raster is 512x342 pixels.
 *
 * We define a horizontal inset and derive the vertical inset
 * to preserve the OS aspect ratio on the physical screen surface.
 */
const SCREEN_WIDTH_MM = 193;
const SCREEN_HEIGHT_MM = 152;
const RASTER_ASPECT = 512 / 342;
const SCREEN_ASPECT = SCREEN_WIDTH_MM / SCREEN_HEIGHT_MM;

const H_INSET = 0.12;
const rasterUWidth = 1.0 - 2 * H_INSET;
const rasterPhysicalW = rasterUWidth * SCREEN_WIDTH_MM;
const rasterPhysicalH = rasterPhysicalW / RASTER_ASPECT;
const rasterVHeight = rasterPhysicalH / SCREEN_HEIGHT_MM;
const V_INSET = (1.0 - rasterVHeight) / 2;

export const RASTER_UV_MIN_X = H_INSET;
export const RASTER_UV_MAX_X = 1.0 - H_INSET;
export const RASTER_UV_MIN_Y = V_INSET;
export const RASTER_UV_MAX_Y = 1.0 - V_INSET;

export interface MacPlusModelResult {
  group: THREE.Group;
  crtMesh: THREE.Mesh;
  /** The brightness adjustment knob on the front-left of the case. */
  brightnessKnob: THREE.Mesh | null;
  /** The original material from the GLB, for use when the screen is off. */
  screenOffMaterial: THREE.Material;
}

export async function loadMacPlusModel(
  crtMaterial: THREE.Material
): Promise<MacPlusModelResult> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(MODEL_PATH);

  const group = gltf.scene;
  group.scale.setScalar(GLB_SCALE);

  let crtMesh: THREE.Mesh | null = null;
  let screenOffMaterial: THREE.Material | null = null;
  let brightnessKnob: THREE.Mesh | null = null;

  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    if (child.name === "screen") {
      screenOffMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x020203,
        roughness: 0.15,
        metalness: 0.0,
        clearcoat: 0.4,
        clearcoatRoughness: 0.1,
      });
      child.material = crtMaterial;
      crtMesh = child;
    } else if (child.name === "screen_glass") {
      child.material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.0,
        metalness: 0.0,
        transmission: 1.0,
        thickness: 0.1,
        ior: 1.52,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      });
      child.renderOrder = 1;
    } else if (child.name === "twist") {
      brightnessKnob = child;
    }
  });

  if (!crtMesh) {
    throw new Error(
      'GLB model missing "screen" mesh. Available meshes: ' +
        getMeshNames(group).join(", ")
    );
  }

  return {
    group,
    crtMesh,
    brightnessKnob,
    screenOffMaterial: screenOffMaterial!,
  };
}

function getMeshNames(root: THREE.Object3D): string[] {
  const names: string[] = [];
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      names.push(child.name || "(unnamed)");
    }
  });
  return names;
}
