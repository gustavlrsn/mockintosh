/** Where a picture's top-left lands in a view. Larger pictures can be dragged; smaller ones stay centred. */

export interface Point {
  x: number;
  y: number;
}

export interface Span {
  width: number;
  height: number;
}

/**
 * `pan` is a drag offset from the centred position. A picture larger than the
 * view is clamped so it never leaves a gap; a smaller one ignores the offset.
 */
export function placedOrigin(picture: Span, view: Span, pan: Point): Point {
  const centredX = Math.floor((view.width - picture.width) / 2);
  const centredY = Math.floor((view.height - picture.height) / 2);
  return {
    x: clampAxis(centredX + pan.x, picture.width, view.width, centredX),
    y: clampAxis(centredY + pan.y, picture.height, view.height, centredY),
  };
}

function clampAxis(origin: number, picture: number, view: number, centred: number): number {
  if (picture <= view) return centred;
  return Math.min(0, Math.max(view - picture, origin));
}

export function pictureOverflows(picture: Span, view: Span): boolean {
  return picture.width > view.width || picture.height > view.height;
}
