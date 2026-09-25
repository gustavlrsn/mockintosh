/**
 * Surface geometry: sample `z = f(x, y, t)` onto a grid, project it through
 * an orbiting orthographic camera, and order the quads back-to-front so the
 * renderer can remove hidden lines with the painter's algorithm.
 *
 * World space is normalized: the domain maps to x, y ∈ [-1, 1] and the z range
 * maps to [-Z_HALF, Z_HALF], so the plot keeps its proportions whatever the
 * units of the equation are.
 */
import type { SurfaceFn } from "./expr";

export const Z_HALF = 0.6;

export interface SurfaceDomain {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface ZRange {
  min: number;
  max: number;
}

/** `cells × cells` quads, i.e. `(cells + 1)²` samples, row-major by y. */
export interface HeightGrid {
  cells: number;
  domain: SurfaceDomain;
  /** Raw function values; non-finite samples are stored as `NaN`. */
  z: Float64Array;
  /** Range of the finite samples, or `null` when there are none. */
  range: ZRange | null;
}

export interface OrbitCamera {
  /** Rotation about the vertical axis, radians. */
  yaw: number;
  /** Elevation above the base plane, radians: 0 is side-on, π/2 is top-down. */
  pitch: number;
  /** 1 fits the whole bounding box in the viewport. */
  zoom: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface Point2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ProjectedPoint extends Point2 {
  /** Distance along the view direction; larger is farther from the viewer. */
  depth: number;
}

export interface ProjectedQuad {
  corners: [Point2, Point2, Point2, Point2];
  depth: number;
  /** Lambert brightness in [0, 1] for a light over the viewer's shoulder. */
  light: number;
}

export interface ProjectedSegment {
  a: Point2;
  b: Point2;
}

/** Everything the renderer needs for one frame. */
export interface SurfaceScene {
  /** Farthest first. */
  quads: ProjectedQuad[];
  /** The two front ground axes, the vertical axis and their ticks, drawn under the surface. */
  axes: ProjectedSegment[];
  /**
   * The grid lines that run more across the screen than into it: along `x`
   * (quad edges a–b and d–c) or along `y` (b–c and a–d). Ridgeline mode draws
   * only these.
   */
  ridges: RidgeAxis;
}

export type RidgeAxis = "x" | "y";

/** Screen x moves by cos(yaw) per unit of world x and by sin(yaw) per unit of world y. */
export function ridgeAxis(camera: OrbitCamera): RidgeAxis {
  return Math.abs(Math.cos(camera.yaw)) >= Math.abs(Math.sin(camera.yaw)) ? "x" : "y";
}

export const PITCH_MIN = (5 * Math.PI) / 180;
export const PITCH_MAX = (89 * Math.PI) / 180;

export const DEFAULT_CAMERA: OrbitCamera = {
  yaw: (-35 * Math.PI) / 180,
  pitch: (28 * Math.PI) / 180,
  zoom: 1,
};

export const DEFAULT_DOMAIN: SurfaceDomain = { xMin: -2, xMax: 2, yMin: -2, yMax: 2 };

const TICKS = 4;
const TICK_LEN = 0.06;

export function sampleSurface(fn: SurfaceFn, domain: SurfaceDomain, cells: number, t: number): HeightGrid {
  const n = cells + 1;
  const z = new Float64Array(n * n);
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < n; j++) {
    const y = domain.yMin + ((domain.yMax - domain.yMin) * j) / cells;
    for (let i = 0; i < n; i++) {
      const x = domain.xMin + ((domain.xMax - domain.xMin) * i) / cells;
      const value = fn(x, y, t);
      if (Number.isFinite(value)) {
        z[j * n + i] = value;
        if (value < min) min = value;
        if (value > max) max = value;
      } else {
        z[j * n + i] = NaN;
      }
    }
  }
  return { cells, domain, z, range: min <= max ? { min, max } : null };
}

/**
 * Grow `range` to cover `next`. A flat surface gets a unit span so it still
 * draws as a plane at mid-height instead of dividing by zero.
 */
export function widenRange(range: ZRange | null, next: ZRange | null): ZRange | null {
  const merged = !range ? next : !next ? range : { min: Math.min(range.min, next.min), max: Math.max(range.max, next.max) };
  if (!merged) return null;
  if (merged.max - merged.min < 1e-9) return { min: merged.min - 0.5, max: merged.max + 0.5 };
  return merged;
}

export function clampPitch(pitch: number): number {
  return Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitch));
}

/** Pixels per world unit for this viewport; stable under rotation. */
function projectionScale(camera: OrbitCamera, viewport: Viewport): number {
  // Bounding sphere of the [-1,1]² × [-Z_HALF, Z_HALF] box, so the plot does
  // not breathe as it turns.
  const radius = Math.sqrt(2 + Z_HALF * Z_HALF);
  return (Math.min(viewport.width, viewport.height) / 2 / radius) * camera.zoom;
}

export function projectPoint(p: Vec3, camera: OrbitCamera, viewport: Viewport): ProjectedPoint {
  const cy = Math.cos(camera.yaw);
  const sy = Math.sin(camera.yaw);
  const cp = Math.cos(camera.pitch);
  const sp = Math.sin(camera.pitch);
  const xr = p.x * cy - p.y * sy;
  const yr = p.x * sy + p.y * cy;
  const up = p.z * cp + yr * sp;
  const scale = projectionScale(camera, viewport);
  return {
    x: viewport.width / 2 + xr * scale,
    y: viewport.height / 2 - up * scale,
    depth: yr * cp - p.z * sp,
  };
}

/** Normalized world z for a raw function value. */
function worldZ(value: number, range: ZRange): number {
  return ((value - range.min) / (range.max - range.min)) * 2 * Z_HALF - Z_HALF;
}

function lightOf(a: Vec3, b: Vec3, c: Vec3, d: Vec3, camera: OrbitCamera): number {
  // Normal from the diagonals, which is well defined for non-planar quads too.
  const ux = c.x - a.x;
  const uy = c.y - a.y;
  const uz = c.z - a.z;
  const vx = d.x - b.x;
  const vy = d.y - b.y;
  const vz = d.z - b.z;
  let nx = uy * vz - uz * vy;
  let ny = uz * vx - ux * vz;
  let nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz) || 1;
  nx /= len;
  ny /= len;
  nz /= len;
  if (nz < 0) {
    nx = -nx;
    ny = -ny;
    nz = -nz;
  }
  // Light from above and to the viewer's left, fixed relative to the camera.
  const yaw = camera.yaw + Math.PI / 4;
  const lx = -Math.sin(yaw) * 0.5;
  const ly = -Math.cos(yaw) * 0.5;
  const lz = 0.7;
  const ll = Math.hypot(lx, ly, lz);
  return Math.max(0, (nx * lx + ny * ly + nz * lz) / ll);
}

/** Corners of the base square, in order around it. */
const BASE_CORNERS: readonly (readonly [number, number])[] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

/**
 * IDL-style axes: the two ground axes run along the base edges that meet at
 * the corner nearest the viewer, ticked outward, and the vertical axis stands
 * on the left-most base corner with ticks pointing left. The back of the box
 * is left open, so nothing is drawn behind the surface.
 */
function axisSegments(camera: OrbitCamera, viewport: Viewport): ProjectedSegment[] {
  const project = (x: number, y: number, z: number): Point2 => {
    const p = projectPoint({ x, y, z }, camera, viewport);
    return { x: p.x, y: p.y };
  };
  const base = -Z_HALF;
  const segments: ProjectedSegment[] = [];
  const projected = BASE_CORNERS.map(([x, y]) => projectPoint({ x, y, z: base }, camera, viewport));
  const nearest = (score: (p: ProjectedPoint) => number) =>
    projected.reduce((best, p, k) => (score(p) < score(projected[best]!) ? k : best), 0);

  const [fx, fy] = BASE_CORNERS[nearest((p) => p.depth)]!;
  // Along x on the front y edge, ticks step further out in y; and vice versa.
  segments.push({ a: project(-1, fy, base), b: project(1, fy, base) });
  segments.push({ a: project(fx, -1, base), b: project(fx, 1, base) });
  for (let k = 0; k <= TICKS; k++) {
    const s = -1 + (2 * k) / TICKS;
    segments.push({ a: project(s, fy, base), b: project(s, fy * (1 + TICK_LEN), base) });
    segments.push({ a: project(fx, s, base), b: project(fx * (1 + TICK_LEN), s, base) });
  }

  const [lx, ly] = BASE_CORNERS[nearest((p) => p.x)]!;
  const tickPx = Math.max(2, Math.round(TICK_LEN * projectionScale(camera, viewport)));
  segments.push({ a: project(lx, ly, base), b: project(lx, ly, Z_HALF) });
  for (let k = 0; k <= TICKS; k++) {
    const at = project(lx, ly, -Z_HALF + (2 * Z_HALF * k) / TICKS);
    segments.push({ a: at, b: { x: at.x - tickPx, y: at.y } });
  }
  return segments;
}

export function buildScene(grid: HeightGrid, range: ZRange | null, camera: OrbitCamera, viewport: Viewport): SurfaceScene {
  const axes = axisSegments(camera, viewport);
  const ridges = ridgeAxis(camera);
  if (!range) return { quads: [], axes, ridges };
  const n = grid.cells + 1;
  const world: (Vec3 | null)[] = new Array(n * n);
  const screen: (ProjectedPoint | null)[] = new Array(n * n);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i;
      const value = grid.z[k];
      if (Number.isNaN(value)) {
        world[k] = null;
        screen[k] = null;
        continue;
      }
      const p = { x: -1 + (2 * i) / grid.cells, y: -1 + (2 * j) / grid.cells, z: worldZ(value, range) };
      world[k] = p;
      screen[k] = projectPoint(p, camera, viewport);
    }
  }
  const quads: ProjectedQuad[] = [];
  for (let j = 0; j < grid.cells; j++) {
    for (let i = 0; i < grid.cells; i++) {
      const ka = j * n + i;
      const kb = ka + 1;
      const kc = ka + n + 1;
      const kd = ka + n;
      const a = screen[ka];
      const b = screen[kb];
      const c = screen[kc];
      const d = screen[kd];
      if (!a || !b || !c || !d) continue;
      quads.push({
        corners: [a, b, c, d],
        depth: (a.depth + b.depth + c.depth + d.depth) / 4,
        light: lightOf(world[ka]!, world[kb]!, world[kc]!, world[kd]!, camera),
      });
    }
  }
  quads.sort((p, q) => q.depth - p.depth);
  return { quads, axes, ridges };
}
