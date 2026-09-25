# Surface — ideas for later

Built so far: equation plotting with orbit and zoom, hidden-line, wireframe,
shaded and ridgeline modes, IDL-style axes, noise functions (`noise`, `fbm`,
`ridged`, `turb`), parameter sliders, printing (single frame and series),
full screen.

These are candidates for future iterations, roughly in order of payoff per
effort.

## Rendering

- **Skirt.** Vertical walls from the surface edge down to the base, like
  IDL's `SKIRT` keyword, so the plot reads as a solid block. Pairs well with
  ridgeline mode.
- **Contours.** Height contours projected onto the base plane, or a top-down
  contour-map mode. Marching squares over the existing `HeightGrid`.
- **Height bands.** Dither density by height instead of by light, like a
  banded topographic map.
- **Axis numbers and titles.** Tick values and x / y / z labels as in IDL.
  The renderer is pixel-only, so labels need text drawn over the raster
  (window) and via `drawString` (print).
- **Perspective.** An optional perspective projection for flyover views.

## Interaction

- **Turntable.** Slow automatic yaw, for full screen and exhibits.
- **Hover probe.** Show `x, y, z` under the pointer with a marker on the mesh.
- **Zoom toward the pointer** instead of the centre.
- **Ripple tank.** Click to drop a stone into a live wave simulation instead
  of a closed-form equation.
- **Integer parameters.** Let a slider snap to whole numbers (membrane modes
  `m`, `n`), perhaps from a naming or range convention.

## More examples

- MATLAB's `peaks`, the monkey saddle `x^3 - 3x y^2`, two-source interference.
- Optimization test functions: Rastrigin, Ackley, Himmelblau, Rosenbrock.
- Physics: square-membrane modes, a circular drum (needs Bessel `j0`),
  point-charge potentials, particle-in-a-box `|ψ|²`.
- Complex magnitude surfaces: `|z^3 - 1|`, the gamma-function landscape.
  Needs complex arithmetic in `expr.ts`.

## Other sources than equations

- **Picture as heightmap.** Brightness becomes height. Surface would claim
  pictures as an *alternate* opener, so it shows up in Preview's "Open in …".
- **Live camera terrain.** Photo Booth's camera feed as a moving surface.
- **Surface documents.** Save equation, parameters, seed, camera and view as a
  file that reopens from the Finder.

## Bigger changes

- **Parametric surfaces.** Torus, Möbius strip, Klein bottle:
  `(x, y, z) = f(u, v)`. The painter's sort already works per quad; the mesh
  would need to accept three coordinate functions and a (u, v) domain.
