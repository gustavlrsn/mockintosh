# Mockintosh on the M5Stack StackChan (CoreS3) — firmware plan

Working plan, 10 September 2026. Goal: a developer clones this repo, follows a short README section, and flashes an M5Stack CoreS3 — in our case the one inside a StackChan robot — with firmware that boots Mockintosh OS on its LCD, driven by touch and a Bluetooth mouse, printing to the user's USB and BLE thermal printers. This is a dev-kit build of the existing OS core, not the [physical product](physical-product-plan.md) (that plan targets a custom board with an e-paper controller and is unaffected); the two share the platform seams and the printer work.

Supersedes the ESP32-C6 plan: the Waveshare C6 board (512 KB SRAM, no PSRAM, 480×480 AMOLED at 314 ppi) made memory the whole problem and needed 2× scaling to be usable. The CoreS3 removes both constraints; see Decisions.

## Where we are

Nothing device-side exists yet; what exists is the groundwork that makes a port a bounded job rather than a rewrite:

| In place | Why it matters for a device build |
| --- | --- |
| `Platform` interface ([`src/platform/types.ts`](../src/platform/types.ts)): display / input / scheduler / storage / `hostCapabilities` / optional clipboard, printer, fetch, loadModule | The whole host surface is one object; a board is a new `src/platform/<host>/` directory, like `web/` |
| `npm run check:core` (`tsconfig.core.json`, `lib: es2022`, no `@types`) | The OS, `@mockintosh/{quickdraw,ui,fs,sdk,print,markdown}` provably use no DOM. Host globals are the allow-list in [`core-env.d.ts`](../src/platform/core-env.d.ts): `console`, timers, `TextEncoder`/`TextDecoder` — which already names Moddable XS as a target engine |
| Headless platform + [`boot.test.ts`](../src/os/boot.test.ts) | The shell boots and is driven end to end from Node; the doc calls it "the starting point for any new host" |
| Packed 1-bit `BitMap` (`packedBits.ts` is the only code that knows the layout); `display.framebuffer` for host-owned memory | 8 px/byte; the 320×240 screen is 9.6 KB. Native code expands it to the panel's RGB565 and can replace the row primitives without the rest of QuickDraw noticing |
| App list is the entry point's choice (`src/systemApps.ts`), `loadModule` optional, `requires: ["camera"]` capability gating | A firmware build ships Finder + a few apps; the OS already hides what the host lacks |
| `PrinterTransport` (byte sink) + `EscPosEncoder` (pure, banded `GS v 0` raster) in `@mockintosh/print`; WebUSB transport in the web platform | Same bytes over USB host or BLE on the device; the encoder is already unit-testable without a printer |

### Measurements taken for this plan

Taken on this checkout (Node 24, V8) with a throwaway Vite lib build of `bootOS` + headless platform + Finder, About, FileViewer, Control Panel at 320×240. Indicative, not device numbers.

| Measurement | Result | Reading for the CoreS3 |
| --- | --- | --- |
| DOM-free bundle, 164 modules, minified | 340 KB (94 KB gzip) | Trivial against 16 MB flash |
| V8 heap after module init (before boot) | ≈1.3 MB | Under XS preload this is flash; even unpreloaded it fits 8 MB PSRAM |
| V8 heap delta for the booted OS (desktop drawn) | ≈82 KB | Live working set; 2–3× under XS. **Not a constraint** with PSRAM — memory is no longer a gate |
| Full frame (layout + paint, two windows, 320×240) | 0.3–0.5 ms in V8 | XS on a 240 MHz LX7 is plausibly 20–100× slower: **10–50 ms**. Interactive without native help is realistic; M4 decides |
| Vite's default `browser` resolution pulls `parse-entities`' browser build (`document.createElement`) via `@mockintosh/markdown` | boot failed in Node until built with node/neutral conditions | The device build resolves for a neutral target |

## The device

### M5Stack CoreS3 (the StackChan head)

The StackChan ships with a CoreS3 pre-installed; the separately sold "StackChan Core" has the identical spec sheet. Same GPIOs, same Moddable target. [CoreS3 docs](https://docs.m5stack.com/en/core/CoreS3), [StackChan docs](https://docs.m5stack.com/en/StackChan).

| Part | What it means for us |
| --- | --- |
| ESP32-S3, 2 × Xtensa LX7 @ 240 MHz, **512 KB SRAM + 8 MB PSRAM**, 16 MB flash | XS heap in PSRAM; Wi-Fi/BLE fit alongside the OS; second core for the display/USB drivers |
| 2.0" IPS, **320×240**, ILI9342C over SPI, reset + backlight via AW9523 IO expander | Exactly the logical resolution the headless boot uses — **1:1, no scaling**. The panel takes RGB565 (153 KB per full frame, ~30 ms at 40 MHz SPI), so the packed framebuffer is expanded per dirty row in native code; a full RGB565 frame never exists in RAM |
| FT6336U capacitive touch, I²C | Moddable's `ft6206` driver is included in the target |
| GC0308 camera, 640×480 | Moddable's CoreS3 target lists camera support; Photo Booth on device (M7) |
| AXP2101 PMU (@0x34), AW9523 (@0x58) | Display rails, backlight, touch reset, camera power, **`USB_OTG_EN`** (5 V out on USB‑C for host mode) — all through these two chips; the Moddable target handles the display/touch part |
| USB‑C: native USB Serial/JTAG + **USB OTG host** | Flashing and `xsbug` over one cable; host mode for a USB printer (or mouse) with an OTG adapter |
| Wi‑Fi, **BLE 5 (no Classic)** | BLE mouse and BLE printers via Moddable's JS BLE client; Classic‑only peripherals (Magic Mouse, SPP printers) cannot work |
| BM8563 RTC, BMI270 + BMM150 IMU, LTR‑553 light/proximity, ES7210 dual mics, AW88298 1 W speaker, microSD | Later: RTC as the Mac clock, proximity to wake, IMU for the body |

### StackChan body

Connected over M5‑Bus; the pin map from the StackChan docs. Everything below is *Later* in this plan except the battery, which just works.

| Part | Pins / address | Use |
| --- | --- | --- |
| 550 mAh battery, INA226 fuel gauge, second USB‑C for charging | I²C | Battery level in the menu bar |
| 2 × Feetech SCS0009 serial-bus servos (360° pan with feedback, 90° tilt; **keep tilt within 5–85°**, never rotate by hand when unsure the servos are unpowered) | UART TX/RX on G6/G7 | A Mac that turns to look at you |
| 12 RGB LEDs, IR transmitter + IRM56384 receiver | G5 send, G10 receive | Apple Remote input; LED status |
| 3‑zone capacitive touch strip on top (Si12T @0x68), PY32L020 IO expander (@0x6F), ST25R3916 NFC | I²C G11/G12 | Hardware keys (brightness/power/interrupt) |
| Grove PORT.B (G8/G9), PORT.C (G17/G18 UART) passed through | — | Spare UART for a serial printer or CardKB later |

### Peripherals the user has

| Peripheral | Path | Nature of the work |
| --- | --- | --- |
| BLE mouse | Moddable BLE client, HID‑over‑GATT (subscribe to the Report characteristic, decode boot‑mouse reports) | Pure JS, ~150 lines; the primary pointer |
| USB thermal printers | USB OTG host, ESP‑IDF `usb_host`, printer class (interface class 7, one bulk‑OUT endpoint) or `usb_host_cdc_acm` for CDC‑style ones | Native XS‑in‑C, ~150–250 lines, implements `PrinterTransport` |
| BLE thermal printers | Moddable BLE client, write to the printer's GATT characteristic at the negotiated MTU with periodic write‑with‑response as backpressure | Pure JS. ESC/POS family (Phomemo, PeriPage, generic `0xFF00/0xFF02`) uses `EscPosEncoder`; "cat printers" (GB0x/MX0x, `0xAE30/0xAE01`) need a second encoder |
| Touch | `ft6206` driver in the Moddable target | Wiring only |

Not in the plan: a keyboard. Text entry during development goes through a serial bridge (M3); a CardKB on Grove or a USB keyboard are one driver each if ever wanted.

## Runtime choice

| Option | Verdict | Why |
| --- | --- | --- |
| **Moddable SDK / XS engine** | **Chosen** | `esp32/m5stack_cores3` is an official target (ILI9342C, FT6336, camera, mics, speaker, IMU, RTC, PSRAM). Preload puts compiled functions and constant data (fonts, sprites) in flash for instant boot. BLE client, Timer, I²C, Serial, littlefs/SD files exist as JS modules — the mouse and BLE printers need no C at all. `core-env.d.ts` already lists XS. Native hot paths (display expansion, USB host) are ordinary XS‑in‑C functions |
| QuickJS as an ESP‑IDF component | Not chosen | Now viable thanks to PSRAM, but no board target, no BLE/camera/display drivers, slower startup. Would be building Moddable's device layer by hand |
| Thin client (board only draws frames streamed from a laptop) | Fallback only | Not "firmware containing Mockintosh". Kept as the fallback if M1 finds an XS blocker |

### Memory

Not the constraint it was on the C6, but still worth stating so the numbers get measured rather than assumed:

| Consumer | Where | Note |
| --- | --- | --- |
| ESP‑IDF, FreeRTOS, Wi‑Fi/BLE stacks, USB host | internal SRAM | BLE on from the start (mouse); Wi‑Fi off until `fetch` is wanted |
| XS machine + JS heap | **PSRAM** (Moddable's PSRAM targets allocate slots there; confirm the CoreS3 target's sdkconfig at M0) | Budget generously; measure high‑water mark at M1/M2 |
| Packed framebuffer + previous‑frame copy for the row diff | 2 × 9.6 KB, internal | Owned by the platform via `display.framebuffer` |
| RGB565 row/band buffers for SPI DMA | 2 × 16 rows × 320 px = 20 KB, internal DMA‑capable | Double‑buffered |
| Camera frame (M7) | PSRAM | 640×480 grey is 300 KB; request QVGA from the sensor |

## Architecture of the device build

Respects the existing layering: only `src/platform/moddable/` may import Moddable modules, exactly as `src/platform/web/` is the only place that touches the DOM. `check:core` is unchanged.

```
src/platform/moddable/           Platform for XS (compiled with Moddable typings, not in tsconfig.core)
  index.ts                       createModdablePlatform({ board }) → Platform
  display.ts                     PlatformDisplay: owns the packed framebuffer; present() → native row expander → screen
  touch.ts                       PlatformInput from the ft6206 driver (down/move/up)
  bleMouse.ts                    PlatformInput from a BLE HID mouse (BLEClient, HID-over-GATT); cursor visible while paired
  serialInput.ts                 PlatformInput from a host-side keyboard bridge over USB serial (development)
  scheduler.ts                   requestFrame on Moddable Timer; now() = Time.ticks
  storage.ts                     FSBackend on littlefs (or the microSD card) — catalog JSON + one blob per file
  camera.ts                      (M7) PlatformCamera over Moddable's camera class, grey frames → Photo Booth dithers
  printers/
    blePrinterTransport.ts       PrinterTransport over BLEClient with MTU chunking + backpressure
    usbPrinterTransport.ts       PrinterTransport over the native USB printer-class host
src/deviceMain.ts                entry: firmware app list, boots the OS (the one non-preloaded module)
src/deviceApps.ts                Finder, About, Control Panel, FileViewer, Picture; Photo Booth once camera exists

firmware/cores3/
  manifest.json                  Moddable manifest: includes esp32/m5stack_cores3, module + preload lists, sdkconfig
  boards/m5stack-cores3.json     display orientation, printer profiles, body present?, BLE mouse allow-list
  native/present.c               packed 1-bit → RGB565 row expander with per-row diff, feeds the display driver
  native/usbprinter.c            (M6) ESP-IDF usb_host client: enumerate class 7 / CDC, bulk OUT, port status
  native/qdrows.c                (M4, only if needed) fillRowBits / blitRowBits / glyph blit natives
  README.md                      the instructions the root README links to
scripts/build-device.ts          Vite lib build of the OS for XS: es2022, neutral resolution conditions,
                                 manualChunks so preloadable code is separate from the entry

packages/print/src/
  encoder.ts                     PrinterEncoder interface (begin / raster / feed / cut / end) + PrinterProfile (dots, dialect)
  escpos.ts                      EscPosEncoder implements PrinterEncoder (existing)
  catPrinter.ts                  CatPrinterEncoder for GB0x/MX0x-family BLE printers
src/platform/web/
  webBluetoothPrinterTransport.ts  same GATT sequence as the device transport; lets BLE printers be tested from Chrome today
```

Build flow: `npm run firmware:build -- --board m5stack-cores3` runs the Vite device build into `firmware/cores3/build/`, then `mcconfig -d -m -p esp32/m5stack_cores3` with our manifest, which compiles the JS to XS bytecode, preloads, links the native parts, and flashes. `--board` stays even with one board: a CoreS3‑SE or a Core2 is a JSON file, not a fork.

### Changes the OS core needs (small, and improvements on their own)

1. **State factories instead of module‑level singletons.** `src/os/state.ts` creates Solid stores/signals at module scope and `src/os/apps.ts`, `packages/ui/src/fonts/registry.ts`, `fonts/drom.ts`, `fonts/extraGlyphs.ts` mutate module‑level `Map`s at runtime. Under XS preload, built‑in instances (Map, Set, Array) in ROM are read‑only (`Map instance is read-only!`) and plain objects are copy‑on‑write through the alias table. Create mutable state inside `bootOS` (`createOSState()`) or lazily on first write. This also removes the hidden singletons the boot test currently works around, so it is worth doing for the web build regardless. (Preload is optional with PSRAM, but a 1.3 MB module‑init heap and a multi‑second boot are not what a Mac does.)
2. **Neutral module resolution for the device bundle** (`resolve.conditions` without `browser`), so About's markdown keeps working.
3. **A `PlatformCamera` service.** Photo Booth currently calls `navigator.mediaDevices.getUserMedia` itself — the web API leaking into an app. Move it behind the platform (`platform.camera?: PlatformCamera` with `start(size) → frames of 8‑bit grey`, `stop()`), implemented by `web/` with `getUserMedia` and by `moddable/` with the camera class. `hostCapabilities` already gates the app.
4. **`PrinterEncoder` + `PrinterProfile` in `@mockintosh/print`.** Two dialects (ESC/POS, cat printer) and two widths (58 mm = 384 dots, 80 mm = 576 dots) are coming; the OS's print flow should pick an encoder from a profile rather than knowing `EscPosEncoder`. Print width becomes a profile property fed to `createPrintPage`. The transport stays a byte sink.
5. **Sprite/font tables stay preloadable.** `defineSprite`/`fromGrid` decode at module evaluation, which under preload happens on the build machine — keep natives out of those module bodies.
6. **`present()` receives the same `BitMap` every frame** (already true) so the native expander holds a stable pointer to its bytes.

## Milestones

Each milestone ends with something you can run and a gate. M1 and the printer encoder work need no hardware and start now; M0 starts when the StackChan arrives.

### M0 — Toolchain and stock Moddable apps on the StackChan

No Mockintosh code. Install ESP‑IDF (the version Moddable SDK 8 pins) and the Moddable SDK on macOS. Back up the factory firmware first (`esptool read_flash`) so the robot can be restored; M5Burner can also reflash it. Build and flash `examples/piu/balls` for `esp32/m5stack_cores3`; then the BLE scanner example (confirm the mouse and each BLE printer advertise and note their names/services), the camera example, and a `files` example on littlefs. Check whether Moddable's build powers `USB_OTG_EN`; if not, note the AW9523 bit for M6. Confirm the target's sdkconfig puts the XS heap in PSRAM. Start `firmware/README.md` while doing it — the install steps are the bulk of the eventual README section.

Gate: balls bouncing on the StackChan's screen, `xsbug` over USB, BLE scan showing the mouse and printers, a camera frame on screen.

### M1 — Boot the OS on XS on the Mac (no hardware)

`scripts/build-device.ts` produces the device bundle; a Moddable `mac` simulator build (or `xst` headless) boots `bootOS` on the headless platform. Fix what breaks: state factories (change 1), resolution (change 2), XS gaps. Measure: XS heap high‑water mark after boot with two windows; time per full frame in the simulator (relative baseline for M4).

Gate: the desktop renders under XS. Heap is recorded, not gated.

### M2 — Pixels on the device

`display.ts` + `native/present.c`: expand packed rows to RGB565 through a 256‑entry LUT into DMA band buffers, diff against the previous frame per row, send only changed spans to the ILI9342C (through Moddable's display driver or directly). Boot at 320×240 with `InMemoryBackend`, no input, splash → Finder desktop.

Gate: Finder desktop on the LCD; record boot time, free heap, time per full‑screen present.

### M3 — Input

Touch via the `ft6206` driver → `PlatformPointerEvent`; the cursor sprite hides while no pointer device is paired and no finger is down (a platform hint or `cursorState.obscured`). `bleMouse.ts`: scan for a HID mouse, bond, subscribe to Report notifications, decode buttons + dx/dy + wheel → pointer events with the cursor visible. Serial keyboard bridge for text entry.

Gate: with the BLE mouse alone — open a folder window, drag it, open About and Control Panel, close them. Same by touch.

### M4 — Make it feel like a Mac

Measure on device. If a full frame is above ~50 ms: move `fillRowBits`/`blitRowBits` (and the glyph blit) to `native/qdrows.c` behind the same signatures; `packedBits.ts` is designed as this seam. Keep the zoom‑rect animation and XOR drag outline working. Consider 30 fps frame pacing in the scheduler.

Gate: window drag tracks the mouse; full frame ≤ ~30 ms.

### M5 — Persistence

`storage.ts` on a littlefs partition (or the microSD card — decide at M0 based on what Moddable's `files` supports cleanly on this target), honouring the FS's write‑before‑catalog ordering.

Gate: move an icon, reboot, it is where you left it.

### M6 — Printing

Before hardware: change 4 (`PrinterEncoder`/`PrinterProfile`, `CatPrinterEncoder`), `webBluetoothPrinterTransport.ts` in the web platform, and a Node `node-usb` transport script so every one of the user's printers is exercised from the Mac against the real encoders. Identify each printer: `system_profiler SPUSBDataType` for the USB ones (vendor/product, class 7 vs CDC, width), nRF Connect / LightBlue for the BLE ones (name, service/characteristic, dialect). Record them as profiles in `boards/m5stack-cores3.json`.

On device: `blePrinterTransport.ts` (JS), then `native/usbprinter.c` + `usbPrinterTransport.ts`, enabling `USB_OTG_EN` on connect. Print from Finder's Print command and from Picture.

Gate: the same page prints identically from Chrome and from the StackChan on a USB printer and on a BLE printer.

### M7 — Camera → Photo Booth

Change 3 (`PlatformCamera`), `camera.ts` over Moddable's camera class at QVGA grey, Photo Booth's existing dithering, print the result (M6).

Gate: take a dithered photo on the StackChan and print it.

### M8 — One‑command build and the README

`npm run firmware:build -- --board <id>` and `npm run firmware:flash`; `firmware/README.md` with prerequisites, exact commands, printer/mouse pairing, troubleshooting; the root README gains a short "Run it on an M5Stack CoreS3 / StackChan" section pointing at it. Verify from a clean clone on a second machine. CI runs the device Vite build and `check:core` (the Moddable toolchain stays out of CI).

Gate: someone else follows the README and ends up with the desktop on their CoreS3.

### Later, not in this plan

- **The body:** SCS0009 servo driver over Serial on G6/G7 (M5Stack's StackChan‑BSP is the reference), tilt clamped to 5–85°; "look at me" driven by the LTR‑553 proximity sensor or a coarse camera brightness centroid; touch strip as hardware keys; IR receiver for an Apple Remote; battery level from INA226 in the menu bar; LEDs as a status ring.
- Wi‑Fi for `fetch` and raw‑TCP (port 9100) network printers; BM8563 RTC as the Mac clock; USB mouse/keyboard and a USB hub (ESP‑IDF hub support) if BLE ever disappoints; on‑screen keyboard; CardKB on Grove; App Store stays hidden on device (no `loadModule`).
- **An e‑paper display for the CoreS3** — see the next section; the M2 row‑diff protocol pointed at a wire instead of a local panel.

## Possible later purchases: e‑paper

The StackChan is the LCD test bed. Exploring e‑paper is a separate, later step and belongs to the [physical product plan](physical-product-plan.md), which already asks for an e‑paper motion measurement before any custom board. Two candidates, noted here so the choice is made deliberately when the LCD work is done:

| | Inkplate 6 MOTION (Soldered) | Modos 6" Paper Dev Kit |
| --- | --- | --- |
| What it is | A complete board: STM32H743 @ 480 MHz, 1 MB SRAM + 32 MB DRAM, TPS651851 EPD PMIC, 6" 1024×758 panel (212 ppi), 91 ms partial refresh (~11 fps) in 1‑bit and 4‑bit modes, buttons, rotary encoder, APDS‑9960 gesture/proximity, IMU, SD, RTC, USB‑C, ESP32‑C3 as a Wi‑Fi modem. No touch. Open‑source Arduino library with the fast waveforms | Glider controller board (Caster FPGA pipeline, per‑pixel state, ~75 Hz scans) + 6" 1448×1072 panel (300 ppi). HDMI / USB‑C (DP Alt Mode) input; USB HID control API; open hardware. Not a microcontroller peripheral |
| How Mockintosh reaches it | **Thin client.** A small STM32 sketch receives packed 1‑bit dirty rects over USB CDC (from the browser build on a Mac, first) or UART/SPI (from the CoreS3's Grove PORT.C, later) and calls `partialUpdate()`. Full frame is 97 KB; dirty rects keep it well under the panel's 91 ms | **Monitor for the browser build.** Plug a Mac in over HDMI and run the web build at the panel's resolution. No S3 involvement; an ESP32 is not a DisplayPort source ([product plan](physical-product-plan.md)), and Caster has no packed‑bitmap input path ([controller notes](custom-epaper-controller.md)) |
| What it answers | How Mac UI motion (drags, XOR outlines, menus) looks and ghosts with a good integrated‑MCU waveform at ~11 fps; whether a 6" e‑paper Mac is pleasant to use. Cheapest honest e‑paper motion test, and reusable as the CoreS3's display | Whether the FPGA per‑pixel scheduling actually delivers the "smooth camera preview" the product plan wants; the baseline the custom controller work is measured against |
| Mac geometry | 2× integer scale → 512×379 logical: the original 512×342 plus a menu bar's worth of rows, at an effective 106 ppi | 2× → 724×536 logical at 150 ppi effective; 3× does not fit 512 wide |
| Price | ~$100–150 depending on enclosure/battery bundle (check Soldered) | $199, limited stock; batches were still shipping from Crowd Supply in spring 2026 — confirm dispatch before ordering |
| Doesn't do | Touch (input stays a BLE mouse on the S3 side, or the encoder/buttons); grayscale we don't need | Standalone MCU use; touch; anything battery‑powered |

Sequence when the time comes: Inkplate first if the question is "what does Mockintosh feel like on e‑paper at all" and a CoreS3‑driven e‑paper Mac is wanted; Modos first if the question is the product plan's — "is the FPGA route worth engineering". Neither replaces the StackChan work; both consume its M2 `present()` row‑diff and, for the Inkplate, its wire transport.

## What the README section should say when this is done

```
## Run it on an M5Stack CoreS3 (or a StackChan)

1. Install ESP-IDF and the Moddable SDK (firmware/README.md, ~30 minutes, once).
2. Plug the CoreS3 in over USB-C.
3. npm install
4. npm run firmware:flash -- --board m5stack-cores3

The CoreS3 reboots into the Finder. Pair a Bluetooth mouse from the Control Panel,
or tap and double-tap on the screen. Printers: see firmware/README.md#printers.
```

## Risks

| Risk | Consequence | Handling |
| --- | --- | --- |
| XS interpreter too slow for interactive frames | Sluggish dragging | M4 native row/glyph primitives behind the `packedBits` seam; frame pacing; 30 ms budget |
| Solid on XS | Proxy/Symbol/WeakMap are supported; preload freezing is the real constraint | State factories (change 1); M1 finds the rest |
| PSRAM latency for the JS heap | Slower than internal SRAM | Measure at M2; keep framebuffers and DMA buffers internal |
| BLE mouse quirks (report descriptors vary; some mice need encryption before notifications) | Mouse pairs but doesn't move | Bond before subscribing; parse the Report Map for the mouse's layout instead of assuming boot protocol; test with two mice |
| A "Bluetooth" printer turns out to be Classic/SPP | Cannot connect from an S3 | Identify at M6‑prep with a phone scanner; such printers go through USB or a laptop |
| USB host: `USB_OTG_EN` not enabled, printer needs more VBUS current than the boost provides, one port shared with serial console | No enumeration; lost debug console while printing | Toggle via AW9523; printers are mains‑powered so VBUS is interface‑only; `xsbug` over Wi‑Fi or accept console loss while in host mode |
| Cat‑printer protocol variants (energy/speed commands differ by firmware) | Faint or smeared prints | Test in Chrome via Web Bluetooth first; profile per printer |
| Factory firmware lost | Robot features gone | `esptool read_flash` backup at M0; M5Burner restores |
| Servo damage from careless handling | Stripped SCS0009 gears | Body work is *Later*; until then never force the head; clamp tilt in the driver |

## Decisions

- 2026-09-10 — Dropped the Waveshare ESP32‑C6 board (512 KB, no PSRAM, 480×480 at 314 ppi needing 2× scaling) in favour of an ESP32‑S3 with PSRAM; the C6 remains a possible thin‑client display, nothing more.
- 2026-09-10 — Chose the M5Stack CoreS3, bought as the $99 StackChan robot (CoreS3 + body with 550 mAh battery, servos, USB‑C) rather than CoreS3 + StackChan Body separately (≈$115). The StackChan phone‑app incompatibility note applies only to M5Stack's factory firmware.
- 2026-09-10 — No keyboard accessory: the OS is pointer‑first; BLE mouse is the primary input, touch second, serial bridge for development text entry.
- 2026-09-10 — Moddable XS over QuickJS: the CoreS3 board target, BLE client, camera and file modules make the mouse and BLE printers pure‑JS work.
- 2026-09-10 — Render 320×240 at 1:1 (the panel matches the headless boot resolution); no scaling code.
- 2026-09-10 — Printers: `PrinterEncoder`/`PrinterProfile` split (ESC/POS and cat‑printer dialects, 384/576 dots) with transports as pure byte sinks; BLE transport in JS, USB transport native; validate everything from Chrome (Web Bluetooth, WebUSB) and Node (`node-usb`) before the device exists.
- 2026-09-10 — Camera access moves behind a `PlatformCamera` service; Photo Booth stops calling `getUserMedia` directly.
- 2026-09-10 — Body features (servos, LEDs, touch strip, IR, NFC) are *Later*; battery is the only body feature the first firmware relies on.
- 2026-09-10 — Board facts live only in `firmware/cores3/boards/<board>.json`, keeping `--board` so CoreS3‑SE/Core2 are data, not forks.
- 2026-09-10 — E‑paper (Inkplate 6 MOTION as a thin‑client display, Modos 6" dev kit as a browser‑build monitor) recorded as possible later purchases, not part of this plan; the S3/LCD work comes first.
