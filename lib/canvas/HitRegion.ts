export interface HitRegion {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cursor?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: (x: number, y: number) => void;
  onMouseUp?: (x: number, y: number) => void;
  onClick?: (x: number, y: number) => void;
  onDoubleClick?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number) => void;
  onScroll?: (deltaY: number) => void;
}

export class HitRegionMap {
  private regions: HitRegion[] = [];
  private hoveredId: string | null = null;
  private pressedId: string | null = null;

  clear(): void {
    this.regions.length = 0;
  }

  add(region: HitRegion): void {
    this.regions.push(region);
  }

  hitTest(x: number, y: number): HitRegion | null {
    for (let i = this.regions.length - 1; i >= 0; i--) {
      const r = this.regions[i];
      if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) {
        return r;
      }
    }
    return null;
  }

  handleMouseMove(x: number, y: number): boolean {
    const hit = this.hitTest(x, y);
    const hitId = hit?.id ?? null;

    if (hitId !== this.hoveredId) {
      if (this.hoveredId !== null) {
        const prev = this.findById(this.hoveredId);
        prev?.onMouseLeave?.();
      }
      this.hoveredId = hitId;
      if (hit) {
        hit.onMouseEnter?.();
      }
    }

    if (this.pressedId !== null) {
      const pressed = this.findById(this.pressedId);
      pressed?.onDrag?.(x, y);
      return true;
    }

    return hit !== null;
  }

  handleMouseDown(x: number, y: number): boolean {
    const hit = this.hitTest(x, y);
    if (!hit) return false;
    this.pressedId = hit.id;
    hit.onMouseDown?.(x - hit.x, y - hit.y);
    return true;
  }

  handleMouseUp(x: number, y: number): boolean {
    const wasPressed = this.pressedId;
    this.pressedId = null;

    const hit = this.hitTest(x, y);
    if (hit?.onMouseUp) {
      hit.onMouseUp(x - hit.x, y - hit.y);
    }
    if (hit && wasPressed === hit.id && hit.onClick) {
      hit.onClick(x - hit.x, y - hit.y);
      return true;
    }
    return wasPressed !== null;
  }

  handleDoubleClick(x: number, y: number): boolean {
    const hit = this.hitTest(x, y);
    if (hit?.onDoubleClick) {
      hit.onDoubleClick(x - hit.x, y - hit.y);
      return true;
    }
    return false;
  }

  handleScroll(x: number, y: number, deltaY: number): boolean {
    const hit = this.hitTest(x, y);
    if (hit?.onScroll) {
      hit.onScroll(deltaY);
      return true;
    }
    return false;
  }

  getHoveredId(): string | null {
    return this.hoveredId;
  }

  clearHover(): void {
    if (this.hoveredId !== null) {
      const prev = this.findById(this.hoveredId);
      prev?.onMouseLeave?.();
      this.hoveredId = null;
    }
  }

  clearPressed(): void {
    this.pressedId = null;
  }

  private findById(id: string): HitRegion | undefined {
    for (let i = this.regions.length - 1; i >= 0; i--) {
      if (this.regions[i].id === id) return this.regions[i];
    }
    return undefined;
  }
}
