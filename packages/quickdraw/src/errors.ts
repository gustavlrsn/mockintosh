/**
 * The single documented fault policy for QuickDraw (§4.4 / §6.1).
 *
 * Routines that the original would dereference `thePort` through (and
 * therefore crash on NIL) throw {@link QDError}. Query routines that never
 * touch the port (`SetRect`, `PtInRect`, `RectRgn`, …) stay portless.
 */
export class QDError extends Error {
  constructor(message = "QuickDraw: thePort is NIL") {
    super(message);
    this.name = "QDError";
  }
}
