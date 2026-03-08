const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "control-manager-migration.md");
let s = fs.readFileSync(filePath, "utf8");

const old =
  "The plan in [future-migrations.md](future-migrations.md) (HitRegion → Control Manager) says scrollbars and other UI could become controls too. That's a larger change:\n\n" +
  "1. **Scroll bars** — Model as controls (e.g. scroll bar control with inUpButton, inDownButton, inThumb); create them on the window; FindControl/TrackControl handle interaction. Then remove scrollbar-specific hit regions from WindowContext.scrollArea and WindowManager.\n" +
  '2. **Other hit regions** — Anything that\'s "button-like" can become a control; custom hit regions (e.g. list items, canvas clicks) may stay as hit regions unless we introduce custom control kinds.\n\n' +
  "This phase is optional and can be done later; the migration plan above focuses on **buttons** and the **Dialog** as the first consumers of the new path.";

const replacement =
  "**Done:** Scroll bars are now fully in Control Manager. WindowManager no longer draws scroll bar pixels or holds thumb-drag state; it delegates creation and drawing to ControlManager via `CreateOrUpdateScrollBarControls` and `DrawScrollBarControls`. FindControlInWindow does a five-part hit-test (inUpButton, inDownButton, inThumb, inPageUp, inPageDown) for procID 4; TrackControl handles all parts including thumb (with onTrackMove). The event loop uses TrackControl for scroll bar hits and updates `win.scrollY`/`win.scrollX` from GetControlValue after tracking.\n\n" +
  "**Remaining (optional):** Other hit regions — anything button-like can become a control; custom hit regions (e.g. list items, canvas clicks) may stay as hit regions unless we introduce custom control kinds.";

const oldUnicode = old
  .replace("That's", "That\u2019s")
  .replace('"button-like"', "\u201cbutton-like\u201d");

if (!s.includes(oldUnicode)) {
  console.error("Old block not found");
  process.exit(1);
}
s = s.replace(oldUnicode, replacement);
fs.writeFileSync(filePath, s);
console.log("Replaced successfully");
