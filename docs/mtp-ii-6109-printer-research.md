# MTP-II-6109 / Goojprt–JingPu 58 mm Bluetooth thermal printer

Research date: 24 September 2026. Primary sources are maker or OEM command manuals that list exact bytes, product specifications for geometry, and device logs that show GATT UUIDs. Experiment notes from Mockintosh are labelled as experiments, not as documentation.

## 1. What this printer is

The unit under study is a battery-powered 58 mm pocket thermal printer branded **Goojprt** on the case and **JingPu / 精普** on the rear sticker. Its button-hold self-test header is `58mm Thermal Printer`, firmware string `MTP-II-6109`, language `PC936 [GB18030]`, `CMD Type: ESC`, USB & Bluetooth, Bluetooth name `MTP-II_BD9A`, PIN `0000`, no cutter line. Those fields are from the unit’s own self-test (experiment / device evidence).

Commercially this pocket form is sold as **GOOJPRT MTP-II** / **PT-210**: 58 mm paper, 48 mm printable width, **384 dots per line**, 203 dpi, ESC/POS, Bluetooth + USB, tear-off (no auto-cutter). [LASA Electronics GOOJPRT MTP-II](http://www.lasaetpda.com/portable-printer/58mm-printer/goojprt-mtp-ii-mini-portable-android.html) · [wholesale MTP-II](https://wirelessbluetoothprinter.wholesale.hardware-wholesale.com/pz6933803-small-size-portable-bluetooth-printer-free-sdk-supplied-58mm-paper-width.html)

**Firmware family.** The self-test vocabulary matches, field for field, the vendor **`ESC ##` command family** documented in **ATOM_PRINTER_CMD_v1.06.pdf** — the Chinese command manual M5Stack hosts for the 58 mm module in its ATOM Printer kit. The PDF has no company name in the body (author metadata “maliang”, 2020-08-17). It is the only primary source found that documents commands whose names and ranges line up with this printer’s self-test lines. [ATOM_PRINTER_CMD_v1.06.pdf](https://m5stack.oss-cn-shenzhen.aliyuncs.com/resource/docs/datasheet/atombase/atom_pritner/ATOM_PRINTER_CMD_v1.06.pdf) · [M5Stack ATOM Printer docs (links the PDF)](https://docs.m5stack.com/en/atom/atom_printer)

| Self-test line (this unit) | Command in ATOM_PRINTER_CMD v1.06 | Section |
| --- | --- | --- |
| Print depth: 38 level | `ESC ##STDP n`, 0 ≤ n ≤ 39 (39 darkest) | §2.10 |
| Speed: 1 | `ESC ##splv n`, portable-BT grades 0–3 | §2.34 |
| Print temperature: 25 C | `ESC # L` prints head temp; `GS g 6` returns `temp:…` | §2.60, §5.7 |
| Code type: codepage | `ESC ##CDTY n` (1 UNICODE, 2 UTF-8, 3 CODEPAGE) | §2.41 |
| Language: PC936 [GB18030] | `ESC ##SLAN n` / `ESC t n` (n=15 = PC936) | §7.1, §1.36 |
| Baudrate: 115200 | `ESC ##SBDR` + 4-byte LE baud | §2.8 |
| CMD Type: ESC | `ESC ##XCMD` (0x30 ESC, 0x31 TSC) | §9.2 |
| Page mode: 0 | `ESC ##PGMD` (page mode; note: §2.40 also uses PGMD for “reprint” — conflict in the manual) | §9.1 / §2.40 |
| Clear buf: disable | `ESC ##CBUF n` | §2.49 |
| Passive buzzer: enable | `ESC ##STBP n` (buzzer bit-mask) | §2.18 |
| BT Mul Conn: enable | `ESC ##BMUL n` | §2.43 |
| Bluetooth name / PIN | `ESC ##BTRN`, `ESC ##BTPI` | §2.38, §2.37 |
| Black label: disable | black-mark on/off frames in ch. 3 | §3.1–3.2 |
| Quality lev: 4 level; Char type: U24; BT BROADCAST: 32 | **no matching command in v1.06** | — |

**Not the same command family (name-alike only).** HPRT / Rego **MPT-II** manuals use the same product nicknames and 384-dot geometry, but their programming manuals document ordinary ESC/POS plus `GS E n` as head timing — **no** `Print depth` / `Quality lev` fields and **no** `ESC ##` vendor block. Settings there go through **MPTTools**. Do not treat HPRT MPT-II PM as the density source for this JingPu self-test. [HPRT Programming Manual for MPT2](https://download.hprt.com/Downloads/page_79.html) · [HPRT MPT-II User Manual Rev.1.3 (mirror)](https://5.imimg.com/data5/SELLER/Doc/2022/3/XG/NU/JO/108832607/80mm-mobile-bluetooth-thermal-printer.pdf)

Some Goojprt PT-210 kits ship a **Caysn** Android SDK whose heat parameter is only three levels (0–2), incompatible with a 0–39 depth; that path is a different firmware dialect. [Goojprt driver CD / PrinterLibs](https://github.com/1rfsNet/GOOJPRT-Printer-Driver)

## 2. Commands and settings a primary source actually documents

Unless noted, bytes and ranges are from **ATOM_PRINTER_CMD_v1.06**. The manual does **not** state which `ESC ##` settings survive power-off; values that appear on the self-test are almost certainly stored, but that needs an on-paper power-cycle check.

| Name | Bytes (hex) | Range / meaning | Stored or per-job | Source |
| --- | --- | --- | --- | --- |
| **Print self-test** | `1B 23 23 53 45 4C 46` (`ESC ##SELF`) | Prints self-test page | — | ATOM §2.1 |
| **Print density (print depth)** | `1B 23 23 53 54 44 50 n` (`ESC ##STDP n`) | **0 ≤ n ≤ 39**; 39 darkest. Example n=3: `…50 03` | Not stated; self-test prints the value → likely stored | ATOM §2.10 |
| Print speed (mm/s) | `1B 23 23 53 54 53 50 n` (`ESC ##STSP n`) | Discrete set {25,30,37,50,…,220}; others ignored | Not stated | ATOM §2.12 |
| **Portable BT speed grade** | `1B 23 23 73 70 6C 76 n` (`ESC ##splv n`) | **0–3** (higher = faster); grade count model-specific | Not stated | ATOM §2.34 |
| Print mode | `1B 23 23 53 50 4D 44 n` (`ESC ##SPMD n`) | 1 uniform-speed, 2 low-current | Not stated | ATOM §2.47 |
| Graphic print mode | `1B 23 23 53 50 53 4D n` (`ESC ##SPSM n`) | 0x30 BLE graphics, 0x31 adaptive, 0x32 uniform | Not stated | ATOM §2.50 |
| Print density on paper | `1B 23 4B` (`ESC # K`) | Prints current density level | Readout | ATOM §2.59 |
| Head temperature on paper | `1B 23 4C` (`ESC # L`) | Prints head temperature | Readout | ATOM §2.60 |
| Speed / battery / BT / version on paper | `1B 23 4D` / `4E` / `4F` / `56` | Readouts | Readout | ATOM §2.61–2.63, §2.53 |
| Query density (reply) | `1D 67 31` (`GS g 1`) | String; manual says level **0–3** (inconsistent with STDP 0–39) | Readout | ATOM §5.2 |
| Query speed / temperature | `1D 67 32` / `1D 67 36` | Strings | Readout | ATOM §5.3, §5.7 |
| Clear-buffer-on-error | `1B 23 23 43 42 55 46 n` (`ESC ##CBUF n`) | 0 off, 1 on | Setting | ATOM §2.49 |
| Buzzer | `1B 23 23 53 54 42 50 n` (`ESC ##STBP n`) | Bit mask (cmd beep, cut, paper-out, errors) | Setting | ATOM §2.18 |
| BT multi-connection | `1B 23 23 42 4D 55 4C n` (`ESC ##BMUL n`) | 0/0x30 off, 1/0x31 on | Setting | ATOM §2.43 |
| BT name / PIN | `1B 23 23 42 54 52 4E…` / `…42 54 50 49…` | Name len &lt; 20; PIN four ASCII digits | Setting | ATOM §2.38, §2.37 |
| Coding type | `1B 23 23 43 44 54 59 n` (`ESC ##CDTY n`) | 1 UNICODE, 2 UTF-8, 3 CODEPAGE | Setting | ATOM §2.41 |
| Language / code page | `1B 23 23 53 4C 41 4E n` (`ESC ##SLAN n`), `1B 74 n` | Includes PC936 | Setting / per-job | ATOM §7.1, §1.36 |
| Baud rate | `1B 23 23 53 42 44 52` + LE uint32 | e.g. 115200 = `00 C2 01 00` | Setting | ATOM §2.8 · M5Stack docs |
| Right limit (width) | `1B 23 23 73 74 72 6D n` (`ESC ##strm n`) | Example n = **384** | Setting | ATOM §2.42 |
| Factory reset | `1B 23 23 52 54 46 41` (`ESC ##RTFA`) | — | — | ATOM §2.4 |
| Raster image | `1D 76 30 m xL xH yL yH …` (`GS v 0`) | Standard ESC/POS raster | Per-job | ATOM §1.41 |
| Realtime status | `10 04 n` (`DLE EOT n`) | n = 1–4; bit tables in manual | Reply | ATOM §1.40 |
| Printer ID | `1D 49 n` (`GS I n`) | n = 1–3 or 49–51 | Reply | ATOM §1.27 |
| Cut (cutter models only) | `1D 56 …` (`GS V`); `ESC ##ECAT` / `EFCT` | Documented for cutter SKUs | Per-job / setting | ATOM §1.28, §2.15–2.16 |
| Paper / dots | — | 58 mm paper, 48 mm print, **384 dots/line** | Hardware | GOOJPRT specs · ATOM `strm` example · M5Stack module |

Hobbyist code that sends the STDP bytes exactly as the manual: [esp32-s3-m5 `printer_drv.c`](https://github.com/go-go-golems/esp32-s3-m5/blob/main/stoms3r/main/printer_drv.c) (`{0x1B,0x23,0x23,0x53,0x54,0x44,0x50,density}`, density ≤ 39).

Dangerous commands in this family (avoid in casual experiments): `ESC ##STIF`, `ESC ##RTFA`, `ESC ##UPPG`, `ESC ##EHEX` / `ETBN`, `ESC ##BTFP`.

### Explicitly absent from ATOM_PRINTER_CMD v1.06

- **GS ( E**, **GS ( K**, **GS ( A**, **DC2 #** — absent (matches Mockintosh: GS ( A ignored; GS ( K / DC2 # / ESC 7 did not change darkness).
- **ESC 7** exists as something else: `1B 37 n` = DTR when out of paper (§1.32). An Adafruit-style three-parameter heat `ESC 7` would be misparsed.
- No command named **quality** / 质量 / 品质 with a 4-step range.

## 3. What we already saw this unit ignore (experiment)

From Mockintosh experiments on this exact printer (not maker documentation):

- ESC/POS **raster** jobs print over Bluetooth LE.
- Epson **GS ( A** did **not** print a self-test; the **button-hold** self-test did. (The family’s documented remote self-test is `ESC ##SELF`, not GS ( A.)
- Per-job presets that looked the same on paper: **GS ( K**, **DC2 #**, **ESC 7** — consistent with those opcodes not being this firmware’s density path.
- The Mockintosh Bluetooth link is **write-only** today, so **GS I**, **GS g ***, and **GS ( E** (need a reply) were not actually tested.

## 4. BLE GATT

ATOM_PRINTER_CMD does not document GATT. Same-class MTP-II / PT-210 devices commonly expose:

- Service **`0x18F0`**
- Write **`0x2AF1`** (Write and/or WriteWithoutResponse)
- Notify / Indicate **`0x2AF0`** (needed for `GS g`, `DLE EOT`, `GS I` replies)

Confirmed in device discovery logs and working libraries: [Stack Overflow CoreBluetooth log](https://stackoverflow.com/questions/31353112/ios-corebluetooth-print-cbservice-and-cbcharacteristic) · [RNBluetoothManager discovery](https://github.com/Tulpar-Yazilim/tp-react-native-bluetooth-printer/blob/master/ios/RNBluetoothManager.m) · [bitbank2/Thermal_Printer](https://github.com/bitbank2/Thermal_Printer/blob/master/src/Thermal_Printer.cpp) · [AbleTP PT-210 examples](https://github.com/MYCAMEL222/AbleTP) · [Web Bluetooth PT210 profile](https://gist.github.com/JakubAndrysek/caf19af777b460c420612f692e9f16e8)

Mockintosh’s `GATT_ESCPOS_18F0` already uses service `18F0` / write `2AF1`. To read replies over BLE, subscribe to **`2AF0`**.

Caveat: some Goojprt PT-210 units use an ISSC UART service (`49535343-…`) instead; that is a different Bluetooth module layout. [CitrusDev PT-210 notes](https://citrusdev.com.ua/portable-bluetooth-thermal-printer-goojprt-pt-210/)

## 5. What is still unknown

- Whether **`ESC ##STDP`** on this exact `MTP-II-6109` changes darkness and updates the self-test `Print depth:` line (highly likely from the manual match; not yet run on this unit). Whether it survives power-off.
- Why `GS g 1` documents density as **0–3** while `STDP` is **0–39** — stale doc, coarse bands, or a different setting.
- **`Quality lev: 4 level`**, **`Char type: U24`**, **`BT BROADCAST: 32`** — no commands in v1.06.
- Whether this portable model obeys **`ESC ##STSP`** (mm/s) or only **`ESC ##splv`** (grade); the manual says grade counts are model-specific.
- The anonymous firmware vendor behind ATOM_PRINTER_CMD (no JingPu-branded PDF found for `MTP-II-6109`).

Suggested Diagnostics checks: send `ESC ##SELF`; `ESC # K` and (with notify) `GS g 1` before/after `ESC ##STDP 10`; power-cycle and re-run the button self-test.

## 6. Sources

1. ATOM_PRINTER_CMD_v1.06 (ESC ## command manual) — https://m5stack.oss-cn-shenzhen.aliyuncs.com/resource/docs/datasheet/atombase/atom_pritner/ATOM_PRINTER_CMD_v1.06.pdf
2. M5Stack ATOM Printer product page (links the manual; 384-dot / 58 mm module) — https://docs.m5stack.com/en/atom/atom_printer
3. GOOJPRT MTP-II product specs — http://www.lasaetpda.com/portable-printer/58mm-printer/goojprt-mtp-ii-mini-portable-android.html · https://wirelessbluetoothprinter.wholesale.hardware-wholesale.com/pz6933803-small-size-portable-bluetooth-printer-free-sdk-supplied-58mm-paper-width.html
4. HPRT MPT-II programming / user manuals (name-alike; different density story) — https://download.hprt.com/Downloads/page_79.html · https://5.imimg.com/data5/SELLER/Doc/2022/3/XG/NU/JO/108832607/80mm-mobile-bluetooth-thermal-printer.pdf
5. Goojprt driver CD / Caysn PrinterLibs (alternate 3-level heat dialect) — https://github.com/1rfsNet/GOOJPRT-Printer-Driver
6. BLE discovery / libraries — https://stackoverflow.com/questions/31353112/ios-corebluetooth-print-cbservice-and-cbcharacteristic · https://github.com/Tulpar-Yazilim/tp-react-native-bluetooth-printer/blob/master/ios/RNBluetoothManager.m · https://github.com/bitbank2/Thermal_Printer/blob/master/src/Thermal_Printer.cpp · https://github.com/MYCAMEL222/AbleTP · https://gist.github.com/JakubAndrysek/caf19af777b460c420612f692e9f16e8
7. STDP byte sequence in working firmware — https://github.com/go-go-golems/esp32-s3-m5/blob/main/stoms3r/main/printer_drv.c
8. Device self-test and Mockintosh experiments — this unit’s paper output and Diagnostics runs (experiment)

Research assistance: [Research MTP-II printer commands](a9079e7c-dcc0-4844-a6b7-32ff890c90d0) located the ATOM_PRINTER_CMD match; bytes above were checked against the PDF text.
