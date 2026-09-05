# Mockintosh physical product — development and commissioning plan

Working plan, 9 September 2026. No hardware has been ordered or commissioned.

Latest commissioning package: [Prototype review and budgetary estimate](prototype-review-and-estimate.md), including exact principal purchase items, proposed FPGA/P4 signal mapping, unresolved supply/revision checks and milestone costs.

Detailed follow-up: [Custom Caster-derived controller](custom-epaper-controller.md). At the proposed logical resolution, packed SPI is sufficient on paper; a new FPGA framebuffer input and independent panel scan generator are required. Retain external pixel-state memory for the first prototype.

### Follow-up: six-inch panel and ESP32 host

Latest preference: 4–6 inches, native resolution ideally close to 512×346, and about 30 fps responsiveness is sufficient. Treat 30 fps as an incoming-content/motion target, distinct from a 33 ms fully settled optical transition. A 512×346 1bpp frame is 22,144 bytes; 30 fps is 664,320 bytes/s before overhead. Existing repo examples use 512×342; final logical height remains to be chosen.

Search found a close resolution match, Waveshare 4.37-inch 512×368, but it is a four-color SPI panel rated at 14-second full refresh, so it does not meet the motion goal. The 5.83-inch 648×480 monochrome SPI panel is likewise rated at 5-second full refresh. Do not select either merely for low resolution. [4.37-inch source](https://www.waveshare.com/product/4.37inch-e-paper-module-g.htm), [5.83-inch source](https://www.waveshare.com/product/displays/e-paper/5.83inch-e-paper.htm).

Retain raw parallel candidates: 4.7-inch 960×540, or a qualified 6-inch 1024×758 panel. The latter could display 512×346 at exact 2× scaling, occupying 1024×692 with 66 physical rows remaining. This is a layout advantage, not verified 30 fps performance or guaranteed Modos compatibility. No panel near native 512×346 with demonstrated 30 fps was verified in this search.

The user considers a 6-inch panel attractive. Treat the Modos 6-inch kit as the preferred reference size. Investigate ESP32-P4 as the application processor for an integrated FPGA design: its camera/display peripherals and greater processing capacity make it a stronger candidate than S3 for this workload. This is a feasibility proposal, not verified Modos compatibility. [ESP32-P4 datasheet](https://documentation.espressif.com/esp32-p4_datasheet_en.html)

At the kit's 1448×1072 resolution, a packed 1bpp frame is 194,032 bytes. Full-image payload is 5.82 MB/s at 30 fps, 11.64 MB/s at 60 fps and 14.55 MB/s at 75 fps, before overhead. These rates are for a custom packed transport; the stock video connection does not carry this compact format. Lower-resolution rendering scaled in the FPGA could reduce host bandwidth, but requires additional controller implementation. Camera/application cadence can differ from the controller's ongoing scan cadence.

The existing Glider video inputs are not a plug-and-play ESP32 connection. Candidate integrations are a validated video bridge or a custom FPGA input with buffering, synchronization and explicit frame ownership. USB HID is control, not a verified image-streaming path. Budget for firmware/gateware and board changes, and retain the Linux HDMI baseline until the MCU route passes a live camera/printing benchmark.

## Direction

Build a self-contained monochrome computer with a camera and thermal printer. Smooth camera preview and animation are the priority; user-provided selling-price range is USD 100–999. Batch size, dimensions, battery requirements, input method and sales markets remain open.

Recommendation: benchmark a Modos 6-inch display kit with the existing browser version of Mockintosh first. Develop a lower-cost ESP32-S3/parallel-display prototype as a comparison, not as an assumed equivalent. Commit to a custom PCB after measuring the desired experience and receiving production quotes. The printer, paper path and power system must be included in this early prototype.

The initial baseline uses a Linux HDMI host because this is a straightforward interface to the existing Modos kit and existing browser camera code. This is a prototype choice, not a commitment to Linux or HDMI in production.

## What exists in this checkout

Inspected current source, not only README (which describes an older React implementation):

- `src/platform/types.ts` separates display, input, timing, storage and printer transport. Display exposes `present(screen): void` and optional host-owned bitmap memory.
- `src/platform/web/` and `src/platform/headless/` exist. No ESP32 platform implementation was found in this checkout. This does not rule out working code elsewhere.
- `src/os/boot.ts` redraws dirty frames and has cursor and zoom-animation paths. E-paper scheduling must cover all presentation paths.
- `packages/print/src/escpos.ts` encodes packed raster images, paper feed and cut commands. It bands raster commands but assembles the encoded job in memory. Actual printer command support still needs verification.
- `packages/print/src/transport.ts` provides a suitable boundary for native UART/USB transport.
- `apps/photobooth/dither.ts` uses HTMLVideoElement, OffscreenCanvas and browser scaling. The native camera path is not implemented by merely declaring a camera capability.
- `src/platform/core-env.d.ts` describes host globals needed by an embedded JS engine. Compatibility, heap consumption, garbage collection and frame timing require on-device validation.

At 1bpp, 400×300 needs 15,000 bytes and 960×540 needs 64,800 bytes before additional buffers. Small framebuffer size does not establish the memory budget of the JS runtime, applications, camera capture and display controller.

## Architecture choices

| Path | Components | Purpose | Decision condition |
|---|---|---|---|
| A — baseline | Linux HDMI host, Modos 6-inch kit, compatible camera, printer controller module | Fastest way to evaluate the intended experience with existing browser software | Proceed if measured e-paper motion and contrast satisfy the user |
| B — cost reduction | ESP32-S3 module with PSRAM, raw parallel e-paper and power circuit, FastEPD/EPDiy, DVP camera, serial printer | Compact MCU product with fewer costly display components | Choose only if full workload meets the same agreed acceptance test |
| C — integrated fast display | Application processor or ESP32-S3, FPGA running adapted Caster, memory, panel power circuit, qualified parallel panel | Preserve Modos-style update scheduling while removing unnecessary monitor features | Commission after A works and quotes justify engineering expense |

An integrated display board is not simply an ESP32 board with a different connector. Modos uses per-pixel transition state and timers; FastEPD's ordinary differential-update loop completes a sequence of passes. A high scan/input rate does not mean black/white optical transitions settle at that rate. [S1–S3]

USB-C on the Modos kit uses DisplayPort Alt Mode for that video path. ESP32 USB support does not make it a compatible DisplayPort source. The Modos USB HID control API is also not evidence of a framebuffer-streaming interface. For an ESP32-to-FPGA product, explicitly design and validate the transport, buffering and flow control. [S1, S4]

For a 400×300 1bpp image, 60 frames/s is 0.9 MB/s of image payload. At 960×540 it is 3.888 MB/s. These arithmetic figures exclude protocol overhead and all FPGA per-pixel state traffic; they are not a proof of feasibility. A custom smaller controller might save cost, but needs an engineering estimate rather than an assumed cheap FPGA substitution.

Use an ESP32 module on the first custom board rather than designing bare-chip RF immediately. This still produces your own PCB. Likewise, a compute module on a custom carrier is a legitimate production architecture. Revisit chip-level integration when measured unit savings justify additional RF, memory-layout and bring-up work.

## Display selection and experiment

Baseline sample: Modos 6-inch 1448×1072 kit, currently listed at $199 including panel and controller. Confirm stock and shipping directly. The 4.7-inch ED047TC1, 960×540, on the LILYGO T5 E-Paper S3 Pro is the compact ESP32 comparison platform. Neither is an automatic final panel selection. [S2, S5]

If staying near 4.2 inches is mandatory, issue a panel RFQ for a raw parallel monochrome panel in that size range. Do not substitute a common 400×300 SPI panel on resolution alone. Do not assume an ED047TC1 works on a Modos kit merely because it is parallel: require exact connector, electrical, timing and waveform support.

Ask the panel supplier for manufacturer and full part/revision number, active area, outline and connector drawings, pixel pitch, optical response in specified modes, temperature-dependent waveforms, VCOM information, power limits, lifetime/update guidance, sample/production MOQ, lead time, written change-notification process and expected production lifetime. Replacement-reader panels are useful for experiments but not a sufficient production supply agreement.

Proposed acceptance targets — engineering goals, not vendor guarantees:

- Feed the preview at 30 frames/s initially; independently measure visible motion, not just submitted frames.
- Aim for camera-to-visible-response latency below 150 ms in fast 1bpp mode. Agree a measured threshold after viewing the reference prototype.
- Use a repeatable pan, moving text, cursor motion, checkerboard and scene-cut sequence. Record optical transition/settling time separately from first response.
- Compare ordered/blue-noise dithering with the existing Atkinson path; quantify static-region shimmer and loss of shadow detail.
- Run a 10-minute preview and assess ghosting, contrast and interruption from cleaning cycles. Decide whether a clean refresh after capture is acceptable.
- Capture and print during preview; verify no resets, corrupted frames, dropped print data or unacceptable pauses.
- Repeat at intended indoor temperature limits and low battery if battery operation is selected.
- Test text at physical size. Integer scaling preserves the 1-bit appearance; 512×342 at 2× fits within 1448×1072, while the 960×540 panel may favor a native-resolution layout.

If Modos does not deliver acceptable apparent motion, increasing host frame rate alone will not solve it. Revisit the experience before engineering a derivative.

## Camera, printing and power

Use an off-the-shelf camera module initially. For Linux, use a supported USB UVC camera for the quickest browser proof, then evaluate a CSI module for integration. For ESP32, select an explicitly supported DVP sensor/module and freeze its lens, field of view, focus distance, connector and power requirements. DVP and CSI modules are not interchangeable.

ESP32-S3 hardware supports simultaneous LCD and camera functions, but the chosen display/camera drivers, DMA, clock configuration, GPIO allocation and memory bandwidth must be proven together. Prepare a complete pin/resource budget before the PCB. Adding a second camera MCU is a fallback with additional BOM and transport latency, not a free fix. [S6]

Start with a 58mm thermal module including its controller, paper sensor and motor drive. A bare thermal mechanism requires substantially more electronics and firmware. A current reference is DFRobot DFR0503-EN V2: $39, 384 dots/line, 58mm paper, and 9–24V supply. Confirm exact interface variant and ESC/POS raster-command compatibility with the supplier. [S7]

The display's pixel width and printer's printable width differ. Render a print page at the printer's width rather than silently cropping the screen. Printed photos can be dithered separately for paper; preview and print need not share the same pixel dimensions or exposure curve.

Native printer support should add controlled chunking/backpressure and paper-out/error reporting. The present transport is write-only; completed byte transmission must not be treated as proof that a job physically printed. Make cutters optional: a tear bar is a simpler first mechanical design.

Use independent, appropriately sized rails for logic, display power and printer heating/motor loads. Validate voltage droop with dense black print bands while camera, radio and display run. Start from a rated external supply. Select battery topology only after measuring peak and average loads; neither a coin cell nor a generic ESP32 development-board regulator is a printer power solution.

The roll diameter, roll door, paper exit, tear edge, printer mounting and heat clearance drive enclosure depth. Build a printed mechanical mockup before freezing PCB dimensions. Make paper replacement and jam clearing possible without exposing electronics or removing the mainboard.

## Software work before custom hardware

1. Build a replayable camera/display benchmark around the existing 1-bit renderer and actual hardware.
2. Add a native camera service boundary for start/stop/capture/frame delivery. Keep device-specific capture and scaling out of Photo Booth's UI.
3. Make display scheduling consume the newest available image instead of building a queue of stale frames. Define buffer ownership while hardware reads it; never mutate a buffer being scanned without an explicit synchronization design.
4. Add display-mode/capability information and optional changed-region hints at the platform boundary. UI drawing remains independent of panel waveforms.
5. For the ESP32 path, validate an embedded JS engine and bundle with the complete shell, fonts, file system and target apps. Keep time-critical scanning, camera transfer and printer transport in native drivers. Measure heap high-water mark and garbage-collection pauses under combined load.
6. Make printer output bounded in memory, handle error/status feedback, and test the selected module's command dialect.
7. Provide recoverable firmware updates, a recovery boot path, versioned settings, factory test mode and serial-number provisioning before pilot assembly.

## Cost and quantity decisions

Treat $100, $499 and $999 as different commercial scenarios until a target is chosen. The current $199 display kit already exceeds the entire $100 selling price. Its price is a prototype reference, not the production cost of an integrated controller. [S2]

Illustrative target model: if landed hardware is allowed 35% of net selling revenue, the budgets are $35 at $100, $175 at $499, and about $350 at $999. These are chosen budget constraints, not BOM estimates or promised margins. First remove applicable tax and channel deductions from consumer-facing prices. Remaining revenue must cover engineering, support, warranty, sales costs and profit.

Request identical-scope quotes at 100 / 500 / 1,000 / 5,000 units. Separate:

- Display panel and adapter/power electronics.
- Application processor/module, memory, storage and radio.
- FPGA/controller and memory, if used.
- Camera and lens assembly.
- Printer mechanism plus controller, roll holder and sensors.
- Power input, conversion, protection, optional battery/charger.
- PCB fabrication, assembly, connectors and interconnects.
- Enclosure, fasteners, assembly labor, functional test, yield allowance and packaging.
- Freight, duties, spare parts and warranty allocation.
- One-time engineering, prototypes, fixtures, molds and testing separately.

Compare three offers: purchase OEM Modos hardware; manufacture a largely unchanged reference design; engineer a simplified integrated derivative. Ask Modos whether an OEM arrangement and integration support are available; this has not been established or requested yet. Removing HDMI/DP input may reduce BOM, but adds a new host interface and verification burden. Keep it if the savings are too small.

Break-even example, not a quote: $30,000 extra engineering divided by $30 per-unit savings requires 1,000 units before that redesign pays back. At 100 units, that engineering adds $300 per unit. Use supplier figures to replace these placeholders.

## Commissioning stages and acceptance gates

| Stage | Suggested scale | Outputs / gate |
|---|---|---|
| 0 — brief | No custom PCB | Input method, size, power/battery, price and batch hypotheses; shared motion test; printer width and camera framing |
| 1 — bench proof | One Modos setup; one MCU comparison if useful | Live Mockintosh camera preview and printing; latency/ghosting/power evidence; choose architecture |
| 2 — engineering prototype | Roughly 3–5 units | Custom carrier/mainboard, module-based radio/compute, printed enclosure, working power tree; pin and thermal margins validated |
| 3 — design validation | Roughly 10–20 units | Final intended panel/camera/printer; endurance, drop/handling, paper-jam and power-loss tests; pre-production test/lab review |
| 4 — pilot production | Roughly 30–100 units | Production process, factory programming jig, yield/rework records, assembly instructions, packaging and traceability |
| 5 — first commercial batch | Set after quotes and pilot | Approved golden samples, incoming inspection, purchase terms, spares, support/recovery process |

Quantities are planning suggestions, not commitments. Obtain a schedule with explicit PCB respin and component lead-time allowance; a working dev-board demo is not evidence of production readiness.

Engage an embedded/electronics engineer for schematic, power and bring-up; an FPGA specialist for any Caster changes; and a mechanical designer for the paper path and enclosure. A PCB assembly factory typically builds supplied files; do not assume it will design or debug the system. One contractor can cover multiple roles if its scope and deliverables are explicit.

Require editable schematics/layout, BOM with exact manufacturer parts and approved alternatives, fabrication/assembly files, firmware and FPGA sources/build instructions, mechanical CAD, test-jig design/software, programming instructions, measured acceptance results, and ownership/access terms. Pay by reviewable milestones. Obtain assembly/test quotes before final layout and mold tooling.

Factory test each unit for display patterns/ghosting, camera focus/alignment, printer feed/raster/paper sensor, input controls, power rails, radios if populated, and recovery programming. Record unit ID, component/board revisions and firmware version; reserve test pads and fixture access in the PCB design.

Before sale, commission market-specific product compliance and battery-shipping assessment, and audit third-party firmware/gateware and visual-asset licenses for the exact shipped versions. Do this early enough to influence enclosure/RF/power design. The repo credits original Macintosh design assets; commercial product branding and asset provenance should be resolved before packaging. This is a work item, not a conclusion about legal permission.

## Immediate next work package

Create the bench demonstrator and supplier RFQ package. First prototype: existing Mockintosh web build on a capable HDMI computer, Modos 6-inch kit, USB camera, thermal module with its specified supply, and temporary input devices. Reuse an existing computer for the display benchmark; select a smaller embedded Linux host only after performance is known. No need to purchase every production candidate now.

Deliverables: short motion/printing demo, measured latency and ghosting report, worst-case power trace, preliminary mechanical volume, and comparable unit/NRE quotes. Then choose a target retail tier and approve the first custom-board scope.

## Sources

- S1: [Modos Glider architecture, hardware and panel types](https://github.com/Modos-Labs/Glider).
- S2: [Modos kit product and price](https://www.crowdsupply.com/modos-tech/modos-paper-monitor).
- S3: [FastEPD API](https://github.com/bitbank2/FastEPD/wiki) and [EPDiy hardware](https://vroland.github.io/epdiy-hardware/).
- S4: [Glider setup/video interface](https://github.com/Modos-Labs/Glider/blob/main/USAGE.md) and [USB HID control API](https://github.com/Modos-Labs/glider-api).
- S5: [LILYGO T5 E-Paper S3 Pro](https://wiki.lilygo.cc/products/t5-series/t5-e-paper-s3-pro/).
- S6: [Espressif LCD/camera peripheral](https://docs.espressif.com/projects/rust/esp-hal/1.0.0/esp32s3/esp_hal/lcd_cam/index.html).
- S7: [DFRobot thermal printer DFR0503-EN](https://www.dfrobot.com/product-1799.html).

Published prices are reference purchase prices checked during research, excluding unconfirmed freight/tax. All planning budgets, quantities and acceptance targets are explicitly proposed assumptions. Component availability and production suitability require supplier confirmation.
