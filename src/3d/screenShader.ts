import * as THREE from "three";

/**
 * CRT screen material using MeshPhysicalMaterial with onBeforeCompile injection.
 *
 * Uses Three.js's full PBR pipeline (lighting, reflections, clearcoat) and
 * injects the OS raster as custom emissive output. The dark glass surface
 * responds to scene lighting while bright pixels glow through.
 *
 * The CRT mesh covers the full glass opening. The OS texture occupies a
 * sub-rectangle defined by rasterMin / rasterMax in UV space.
 * Outside that region, the surface is dark CRT glass.
 */

export interface CRTShaderOptions {
  screenTexture: THREE.Texture;
  emissiveIntensity?: number;
  scanlineIntensity?: number;
  rasterMin?: [number, number];
  rasterMax?: [number, number];
}

export function createCRTPhysicalMaterial(
  options: CRTShaderOptions
): THREE.MeshPhysicalMaterial {
  const {
    screenTexture,
    emissiveIntensity = 1.5,
    scanlineIntensity = 0.03,
    rasterMin = [0.0, 0.0],
    rasterMax = [1.0, 1.0],
  } = options;

  // A 1x1 black texture ensures Three.js includes UV varyings and the
  // emissive map code path in the compiled shader.
  const dummyTex = new THREE.DataTexture(
    new Uint8Array([0, 0, 0, 255]),
    1,
    1,
    THREE.RGBAFormat
  );
  dummyTex.needsUpdate = true;

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x050508,
    roughness: 0.15,
    metalness: 0.0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    emissive: 0xffffff,
    emissiveIntensity: 1.0,
    emissiveMap: dummyTex,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uScreen = { value: screenTexture };
    shader.uniforms.uCrtEmissiveIntensity = { value: emissiveIntensity };
    shader.uniforms.uScanlineIntensity = { value: scanlineIntensity };
    shader.uniforms.uRasterMin = {
      value: new THREE.Vector2(rasterMin[0], rasterMin[1]),
    };
    shader.uniforms.uRasterMax = {
      value: new THREE.Vector2(rasterMax[0], rasterMax[1]),
    };

    (mat as CRTPhysicalMaterial).__crtShader = shader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      /* glsl */ `
        uniform sampler2D uScreen;
        uniform float uCrtEmissiveIntensity;
        uniform float uScanlineIntensity;
        uniform vec2 uRasterMin;
        uniform vec2 uRasterMax;
        void main() {
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      /* glsl */ `
        {
          vec2 screenUv = vec2(vEmissiveMapUv.x, 1.0 - vEmissiveMapUv.y);
          vec2 rUv = (screenUv - uRasterMin) / (uRasterMax - uRasterMin);
          bool inRaster = rUv.x >= 0.0 && rUv.x <= 1.0
                       && rUv.y >= 0.0 && rUv.y <= 1.0;
          if (inRaster) {
            vec4 osTexel = texture2D(uScreen, rUv);
            float scanline = 1.0 - uScanlineIntensity * mod(floor(rUv.y * 342.0), 2.0);
            totalEmissiveRadiance = osTexel.rgb * scanline * uCrtEmissiveIntensity;
          } else {
            totalEmissiveRadiance = vec3(0.0);
          }
        }
      `
    );
  };

  return mat;
}

export type CRTPhysicalMaterial = THREE.MeshPhysicalMaterial & {
  __crtShader?: { uniforms: Record<string, { value: unknown }> };
};
