# Standalone UI kit name research

**Target (18 September 2026):** keep the kit as **`@mockintosh/ui`**. The public catalog site is **`ui.mockintosh.com`** (`sites/ui/` in this repo) — same pattern as `ui.shadcn.com`. Macintosh is the origin story (packed 1-bit framebuffer); the site itself should be a 1-bit widget catalog, not OS chrome. Mockintosh apps keep importing through **`@mockintosh/sdk`**. A later brand (Bitface, etc.) is not the plan.

---

Checked 13 September 2026. Context: [extraction plan](dither-ui-extraction-plan.md). This records public product searches, exact npm registry lookups, public GitHub repository search, and domain RDAP queries. No names were registered or purchased. Trademark clearance and registrar checkout availability were not established.

## Recommendation (superseded)

The 13 September shortlist below is historical. The adopted target is `@mockintosh/ui` + `ui.mockintosh.com`.

Do not adopt **Dither UI** as a published name: the exact npm package already exists in an adjacent category. Shortlist at the time was **Rasterlet** / **Ditherform**; neither is the plan.

My naming assessment:

- **Rasterlet:** compact and distinctive, suggests pixel rendering without restricting the kit to monochrome or retro styling. Could sound like a low-level rasterizer; use the descriptor “Solid interfaces for canvas and framebuffers.”
- **Ditherform:** combines the original character with a suggestion of forms and interfaces. More memorable than Ditherplane, but still positions the product around a visual technique.
- **Dotplane:** strong conceptual fit for pixels and surfaces, but existing .NET software uses the name. Keep as a lower-ranked candidate rather than describe it as clear.
- **Ditherplane:** no product collision found in this search; longer and less natural to say, and inherits Ditherform's aesthetic association.

## Dither UI findings

1. **Exact npm name taken.** The registry returned `dither-ui`, latest `0.1.0`, created 10 May 2026. Its metadata and README describe React components for ordered dithering, canvas gradients, and shadows. This is a direct category overlap, even though our Solid framebuffer renderer would work differently. [npm registry](https://registry.npmjs.org/dither-ui).
2. **Exact domain registered.** Verisign RDAP returned a registration record for `dither-ui.com`, registered 14 July 2026 with expiration 14 July 2027. [Registry record](https://rdap.verisign.com/com/v1/domain/dither-ui.com).
3. **Existing public UI association.** Halftone UI's own site credits and links to `dither-ui.com` as an influence. A direct request to that domain during this check returned a GitHub Pages “Site not found” page. That does not undo its registration or establish that the prior product/name is available. [Halftone UI](https://halftone-ui.com/).

These observations do not establish that the npm package and referenced website share an owner. They are independently sufficient reasons to avoid the exact name for a new UI kit.

## Candidate registry checks

“Not found” is the actual result, rather than a guarantee of registration eligibility. npm can reserve or reject names, and a domain can be reserved/premium even when RDAP has no registration record. Availability can also change after this check.

| Candidate | Exact npm lookup | Exact domain lookup | Public project findings |
| --- | --- | --- | --- |
| Rasterlet | [`rasterlet`](https://registry.npmjs.org/rasterlet): `Not found` | [`rasterlet.dev`](https://pubapi.registry.google/rdap/domain/rasterlet.dev): RDAP 404 | No matching software product found in exact web/name searches |
| Ditherform | [`ditherform`](https://registry.npmjs.org/ditherform): `Not found` | [`ditherform.dev`](https://pubapi.registry.google/rdap/domain/ditherform.dev): RDAP 404 | No matching product found; ordinary `ditherForm` identifiers occur in graphics source |
| Dotplane | [`dotplane`](https://registry.npmjs.org/dotplane): `Not found` | [`dotplane.dev`](https://pubapi.registry.google/rdap/domain/dotplane.dev): RDAP 404 | [OrnaVerse/dotplane](https://github.com/OrnaVerse/dotplane), a .NET hosting panel, and [sjefvanleeuwen/dotplane](https://github.com/sjefvanleeuwen/dotplane), an experimental .NET/Linux backplane |
| Ditherplane | [`ditherplane`](https://registry.npmjs.org/ditherplane): `Not found` | [`ditherplane.dev`](https://pubapi.registry.google/rdap/domain/ditherplane.dev): RDAP 404 | No matching product found; `ditherPlane` appears as a function in [x265 code](https://mailman.videolan.org/pipermail/x265-commits/2015-July/000643.html) |

The GitHub REST search for `dotplane OR rasterlet OR ditherform OR ditherplane in:name` returned the two Dotplane repositories above and an unrelated `dotplanet` repository, with `incomplete_results: false`. This is a public repository-name search, not an organization-handle reservation check or exhaustive proof of absence. Search-engine checks alone initially missed the Dotplane repositories, which is why direct registry checks matter.

Only the exact unscoped npm names and `.dev` domains listed above were checked for the alternatives. Their `.com`, `.io`, scoped npm organization names, and social handles remain unchecked.

## Other ideas screened out

| Name | Existing use relevant to naming |
| --- | --- |
| Halftone UI | [Canvas component library](https://halftone-ui.com/), particularly close category overlap |
| Inkplane | [Handwriting/infinite-canvas Obsidian plugin](https://github.com/SirwanAfifi/inkplane) |
| RasterKit | [Screenshot/PDF rendering service](https://rasterkit.com/) and a [Rust raster toolkit](https://docs.rs/crate/rasterkit/latest) |
| Pixelplane | [RGB LED display system](https://pixelplane.org/), adjacent to our display targets |
| Dotfield | [Flutter graphics package](https://pub.dev/packages/dotfield/versions) |
| Dotframe | [Creative studio](https://www.dotframe.co/about) and [Japanese production company](https://dotframe.co.jp/about/) |
| PixelWeave | [Software/web studio](https://pixelweave.tech/) |
| Inkfield | [Digital ink painting software](https://github.com/ileivoivm/inkField) |
| Dotloom | [IT/software services company](https://www.dotloom.com/) |

These are practical distinctiveness concerns, not conclusions about legal rights.

## How to finish a selection

Choose the preferred identity and spelling, then check the intended registrar's live purchase result, npm publish eligibility, GitHub organization handle, and relevant trademark registers before investing in the public brand. No formal trademark search was performed here. Keep the extraction plan's existing filename until a name is selected, so existing links continue working.

Suggested presentation: **“Rasterlet — Solid interfaces for canvas and framebuffers.”** Mockintosh can then say **“Built with Rasterlet.”** This is a recommendation, not a rename decision.
