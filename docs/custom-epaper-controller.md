# Caster-derived controller for Mockintosh

Research date: 2026-09-09. Primary-source inspection of current Modos-Labs GitHub mirrors. Architecture proposal, not a validated design or quotation.

Follow-up: [Prototype architecture review, shopping list and budgetary quotation](prototype-review-and-estimate.md) specifies a candidate direct FPGA connection through Glider J3, the camera-inclusive P4 kit, and the engineering milestones. Its base demonstration uses the bundled 1448×1072 panel pending reliable sourcing of a 1024×758 panel.

## What is reusable

[Glider's documentation](https://github.com/Modos-Labs/Glider#design-of-caster-and-glider) describes an FPGA pipeline that reads each pixel's state, selects drive voltage, and writes updated state. Each pixel has its own timer; fast binary mode can reverse an ongoing transition. It processes four physical pixels per clock. Published reference utilization is 1,704 flip-flops, 2,531 LUT6s and 60 KB BRAM, explicitly dependent on build options and target. This is not a synthesis result for our variant and LUT6 counts cannot directly size another FPGA family.

[caster.v](https://github.com/Modos-Labs/Caster/blob/master/rtl/caster.v) exposes four 8-bit luminance pixels per cycle through FIFO-style valid/ready signals, a video-vsync input, four 16-bit pixel states in/out, SPI control registers and panel outputs. Its scan begins on incoming vsync. Therefore a packet input requires a framebuffer reader that generates a repeatable local raster; sending a packed bitmap to the existing control SPI is not already supported as a full-image path.

[top.v](https://github.com/Modos-Labs/Caster/blob/master/rtl/spartan6/top.v) confirms that the reference wrapper contains x16 DDR3, separate video and control inputs, and FPGA-specific memory/clock integration. The low-risk port retains the pixel engine and changes its surrounding input path.

## Proposed ESP32-P4 connection

Use a dedicated packed 1bpp SPI input at an initially conservative 20 MHz. This is a proposal requiring a new FPGA receiver and host driver. 512 × 346 / 8 = 22,144 bytes per image; at 30 fps, payload is 664,320 bytes/s (5.315 Mbit/s). A raw 20 MHz single-data-line SPI transfer takes 8.86 ms per frame; 40 MHz takes 4.43 ms, excluding commands, pauses and software. Thus a wide RGB bus or HDMI conversion is unnecessary for this reduced application.

New logic: packet parser, bounded receive buffer, clock-domain crossing, frame length/sequence validation, optionally CRC, two target-image buffers, commit handshake, panel-frame-boundary swap, and raster reader with integer scaling and margins. Prefer latest complete frame to an accumulating queue for live preview. Keep the previous target when no complete image arrives. Expand 1bpp to the existing core's luminance representation initially; reduce internal width later if worthwhile.

At 2×, 512 × 346 occupies 1024 × 692 on a 1024 × 758 panel. The remaining 66 rows can be fixed white margins. Maintain state for every physical pixel initially. Sharing one state among a 2×2 block could reduce memory traffic but requires a reworked engine, repeated-line output, and validation of initialization, timing and refresh behavior. It is not a free consequence of scaling.

## Separate incoming images from panel scans

30 camera/application frames per second does not mean 30 electrical panel scans per second. The proposed framebuffer reader can continue at a qualified 60–85 Hz panel cadence while reusing the latest target. Caster's drive counters count scans; lowering the scan frequency changes voltage-pulse durations and timing resolution. Qualify the panel/waveform first. The physical ink still needs multiple scans to settle.

## Memory budget and feasible reductions

1024 × 758 = 776,192 physical pixels. Existing 16-bit state requires 1,552,384 bytes. Merely reading and writing it once per scan costs:

| Electrical scans/s | State read + write, active pixels only |
|---:|---:|
| 30 | 93.14 MB/s |
| 60 | 186.29 MB/s |
| 85 | 263.91 MB/s |

This excludes target-image reads, refresh, arbitration, protocol losses and peak/blanking constraints. Applying Glider's generic 4.5 bytes/pixel budget gives 209.57 MB/s at 60 scans/s, also excluding overhead. Our packed and scaled target reader could use less target-read bandwidth than that generic design. External memory remains the conservative starting point.

[pixel_processing.v](https://github.com/Modos-Labs/Caster/blob/master/rtl/pixel_processing.v) shows fast-monochrome state uses a six-bit counter, two-bit minimum-drive holdoff, one previous-pixel bit, plus mode/reserved bits. Restricting modes makes compression possible, but retaining every existing monochrome field still needs nine bits. Do not promise an eight-bit state without changing behavior. Retain initialization and clearing even in a strictly 1bpp product.

Savings candidates: remove HDMI/DP receiver chips and video connectors; remove corresponding negotiation and decoder initialization; omit RGB conversion, dithering, grayscale waveforms, hybrid modes and OSD; port housekeeping from Glider's STM32 to P4; select one panel connector and size supplies for it. Preserve FPGA configuration, power sequencing, VCOM adjustment, rail fault detection and reset safety. A simpler SDR SDRAM interface may work after state/bandwidth optimization, but selecting it solely from average image ingress is a mistake.

Spartan-6 LX16 + existing DDR3 is the reference baseline and reduces porting uncertainty. The project requires ISE 14.7 and generated Xilinx IP. ECP5 or Gowin families are possible subjects of an engineering comparison, not verified drop-in targets: DDR controller, FIFOs, PLLs, I/O constraints and timing must be replaced/rebuilt, then synthesis, place-and-route and sustained-memory tests must establish fit. No new-family chip selection or savings claim is established by these sources.

## Panel qualification

[Glider's panel list](https://github.com/Modos-Labs/Glider#screen-list) explicitly says it is not an all-compatible list and is aimed at hobbyists buying used panels. It lists ED060XC3 (Pearl, 1024×758, 34-pin), ED060XC8 (Carta, same resolution, 35-pin), and ED060XD4 (Carta, same resolution, 34-pin) as tested. ED060XCG/XCH are newer 1024×758 sourcing leads but not marked tested. Treat these as sample candidates, not production procurement approvals. Require exact suffix, connector orientation/pinout, rails, VCOM, timing, temperature behavior, waveform rights/data, volume availability and samples. Current 4.7-inch examples are 960×540 and do not fit 512×346 at exact 2×.

## License boundaries

[Caster README](https://github.com/Modos-Labs/Caster#license): core design (caster.v downward) CERN-OHL-P v2; target-specific Xilinx DDR/FIFO/PLL IP separately licensed with Xilinx tools; simulation MIT; blue noise public domain. [Glider README](https://github.com/Modos-Labs/Glider#license): PCB CERN-OHL-S; firmware MIT except USB PD library BSD; documentation public domain except attributed references. A new PCB using permissive Caster is a different reuse choice from modifying strongly reciprocal Glider board files. Commission a clear license inventory and deliverable/source terms; do not describe the entire project as MIT/permissive.

## First engineering contract

Proposed partition: camera and the browser build of Mockintosh stay on the host computer; a later board may receive packed frames. The FPGA (framebuffer reader, scaling, Caster) drives the raw parallel panel. The FPGA has external state memory and a sequenced panel power supply.

Start with a P4 development board and separate controller board with a replaceable panel adapter. Combine the boards after display qualification. The [P4 datasheet](https://documentation.espressif.com/esp32-p4_datasheet_en.html) documents general-purpose SPI and camera/image-processing peripherals. A dedicated SPI bus plus ready/interrupt and reset is a reasonable proposed interface; match electrical levels to the selected FPGA bank.

The inspected Mockintosh checkout has a bitmap `present` boundary in the browser and headless hosts. Photo-booth conversion uses browser video and canvas APIs. The shell stays there. Printer byte transport exists, but a production module still needs fault and status handling.

Commission the packet input, framebuffer/scaler wrapper, baseline FPGA integration and measured panel demonstration before final combined PCB design. Acceptance: repeated 512×346 packed frames at 30 fps under concurrent camera and print load; no tearing or underrun; quantified camera-to-visible latency and ink settling/ghosting; safe power sequencing and host reset behavior; measured rail peaks, sustained memory bandwidth and power; exact reproducible source/toolchain and synthesis/timing reports. Only then compare a cheaper FPGA/memory port against the known working baseline.

## Cost decision and manufacturing deliverables

No supplier quotation or custom synthesis has been obtained. Lower resolution and 1bpp simplify the host connection and remove consumer video interfaces, but external memory, FPGA packaging, multilayer PCB, panel power and production testing remain.

Request separately priced work packages: (1) retain the reference FPGA/memory architecture and replace its video input; (2) port the proven prototype to a cheaper FPGA/memory combination. Ask for parts and assembly estimates at 100, 1,000 and 10,000 units, separating panel, controller and whole-product cost. Compare porting cost with actual per-unit savings.

Require editable schematic/layout, exact orderable BOM and alternatives, FPGA/P4 source, pinned toolchain, reproducible builds, timing reports, panel calibration procedure, programming/test fixtures and production acceptance procedure. Optical tests should include camera motion, fine text after motion, repeated black/white reversals and intended temperatures. Accepting 30 incoming frames per second alone does not establish a satisfactory 30-fps viewing experience.
