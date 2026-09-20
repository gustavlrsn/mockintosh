# System 6.0.5 vs 7.5.3 as 1-bit UI asset sources

Research date: 2026-09-15. Claims below follow Apple manuals, Apple technical notes, and this repo’s System 7.5.3 extract. Archive.org disk images are listed only as later extract locations, not as the source of resource-type facts. This note did not open a System 6.0.5 resource fork.

## Recommendation for Mockintosh

Keep the 7.5.3 catalogs for authored 1-bit members (`PAT#` 0, `CURS` 1–4, `ICN#` / `ics#` / `SICN` / `ICON`). Drop the System 7.5 Desktop Patterns `ppat`s as the 1-bit desktop source; drive the desktop from System `PAT#` 0, the list Apple documents as the MacPaint / black-and-white desktop patterns.

Do not switch the whole catalog to 6.0.5. That release is not a monochrome-only System, and a System+Finder extract would lose System 7 folder variants, more cdev icons, and the color family members a future `PixMap` can use. A later 6.0.5 extract is worth doing only to confirm `PAT#` / `CURS` bytes and as a 1-bit `ICN#` baseline — a hybrid check, not a wholesale replace.

## 1. System 7.5.3 is color-first in new assets, not color-only hardware

Apple still lists System 7.5.3 among Macintosh Plus system software (1-bit built-in CRT). [Apple Support, Macintosh Plus specifications](https://support.apple.com/en-us/112183). The 7.5 feature set is nonetheless color-oriented: a common 68K/PowerPC System, Display Manager, and a new Desktop Patterns application whose patterns are `'ppat'`s moved out of General Controls. [Apple Technical Note OV21](https://preterhuman.net/macstuff/technotes/ov/ov_21.html). The System 7.5 Upgrade Guide calls them “more colorful and texture-rich.” [Apple, System 7.5 Upgrade Guide](https://vintageapple.org/macbooks/pdf/Macintosh_System_7.5_Upgrade_Guide_1994.pdf).

1-bit resource types:

| Type | Role |
| --- | --- |
| `ICN#` | 32×32 black-and-white icon + mask |
| `ics#` | 16×16 black-and-white icon + mask |
| `ICON` | 32×32 black-and-white icon, no mask; menus/dialogs, not Finder |
| `SICN` | 16×16 black-and-white list (conventionally icon + mask); menus / Standard File |
| `PAT ` | One 8×8 bit pattern |
| `PAT#` | List of 8×8 bit patterns |
| `CURS` | Black-and-white cursor |

Color / multi-bit types:

| Type | Role |
| --- | --- |
| `icl8` / `ics8` | 32×32 / 16×16, 8 bits/pixel Finder family members |
| `icl4` / `ics4` | 32×32 / 16×16, 4 bits/pixel |
| `ppat` | Color QuickDraw pixel pattern |
| `cicn` | Color icon (`PixMap` + mask + bitmap) |
| `crsr` | Color cursor |

Icon-family members share one ID; color members reuse the `ICN#` / `ics#` mask. Finder prefers the deepest member the screen allows. [Apple, Creating Icons for the Finder](https://dev.os9.ca/techpubs/mac/Toolbox/Toolbox-448.html); [Apple HIG, The Finder Icon Family](https://dev.os9.ca/techpubs/mac/HIGuidelines/HIGuidelines-168.html); [Apple, Pattern / Pattern List / Pixel Pattern resources](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-195.html); [Apple, Cursor resources](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-401.html); [Apple, SICN](https://dev.os9.ca/techpubs/mac/MoreToolbox/MoreToolbox-270.html).

This repo’s 7.5.3 extract still has the 1-bit System list: `PAT#` 0 (38 entries) and `CURS` 1–4. The Desktop Patterns suitcase is the color-era addition (74 `ppat`s; only 7 are 1-bit with a tile).

## 2. System 6.0.5 was not “fully monochrome”

6.0.5 (Finder 6.1.5, March 1990) is the Macintosh IIfx System release and is also listed for the Plus. [AppleCare 15582](https://web.archive.org/web/20020812062805/docs.info.apple.com/article.html?artnum=15582); [Apple Support, Macintosh Plus](https://support.apple.com/en-us/112183). Color QuickDraw dates to the Macintosh II (March 1987). 68000 machines keep basic QuickDraw. [Apple develop 6, Spring 1991](https://vintageapple.org/develop/pdf/develop-06_9104_Spring_1991.pdf); [Apple, About Color QuickDraw](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-198.html). A 6.0.5 IIci manual ships the four-disk set (System Tools, Printing Tools, two Utilities) and documents the Monitors cdev for built-in color/gray video. [Apple, Macintosh IIci Special Options](https://vintageapple.org/macbooks/pdf/Macintosh_IIci_Special_Options_&_Technical_Information_1990.pdf).

32-Bit QuickDraw 1.2 **did** ship with 6.0.5 as a **separate** Installer file, still an INIT, not baked into the System resource fork. Version 1.0 was a May 1989 Color Disk file; 1.2 is “an integral part of the System Software which can be installed by the standard Installer (although the file is still separate).” [Apple Technical Note QD01](https://leopard-adc.pepas.com/technotes/qd/qd_01.html). develop: “released as an INIT with System 6.0.5.” [Apple develop 6](https://vintageapple.org/develop/pdf/develop-06_9104_Spring_1991.pdf).

What the 6.0.5 **System file** itself stored was not inventoried here. Apple documents `PAT#` 0 and the standard `CURS` IDs as System-file 1-bit resources (below). Color types `ppat` / `cicn` / `crsr` are Color QuickDraw resources and can live in cdevs or the 32-Bit QuickDraw file on a Mac II install. The 6.0.5 disk notes list Color, Monitors, and Startup Device as SE/II Control Panel documents. [earlymacintosh.org, Apple 6.0.5 set notes](https://www.earlymacintosh.org/disk_images.html). That is not a resource map of the System file.

## 3. Icon families and Desktop Patterns are System 7 / 7.5

HIG shows “a family of icons for System 7” (`ICN#`, `ics#`, `icl4`, `icl8`, `ics4`, `ics8`). [Apple HIG](https://dev.os9.ca/techpubs/mac/HIGuidelines/HIGuidelines-168.html). The Finder Interface chapter is the System 7 contract: at minimum an `ICN#`; small and color members are additional family resources with the same ID. [Apple, Creating Icons for the Finder](https://dev.os9.ca/techpubs/mac/Toolbox/Toolbox-448.html). `ICON` / `cicn` / `SICN` stay application/Standard File types; Finder does not display them. [Apple, Icon Utilities](https://dev.os9.ca/techpubs/mac/MoreToolbox/MoreToolbox-270.html). System 7 also adds the special System Folder directories (Apple Menu Items, Control Panels, Extensions, …) whose icons a 6.0.5 Finder does not have. [Apple, Using the System Folder](https://dev.os9.ca/techpubs/mac/Toolbox/Toolbox-460.html).

Through System 7.1 the desktop color/pattern UI is General Controls; `SetDeskCPat` paints a `ppat` (default ID 16) on Color QuickDraw machines, else the binary `DeskPattern`. [Apple, Control Panels](https://dev.os9.ca/techpubs/mac/MoreToolbox/MoreToolbox-455.html); [Apple, SetDeskCPat](https://dev.os9.ca/techpubs/mac/Toolbox/Toolbox-273.html). System 7.5 moves that UI to Desktop Patterns and stores the new tiles as `'ppat'`. [Apple TN OV21](https://preterhuman.net/macstuff/technotes/ov/ov_21.html).

System 6’s black-and-white desktop is a bit pattern. Apple’s standard gray desktop example is an 8×8 `Pattern`; the System file `PAT#` 0 (`sysPatListID`) is “the standard Macintosh patterns used by MacPaint.” [Apple, About QuickDraw Drawing](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-59.html); [Apple, GetIndPattern](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-177.html). This note did not open a System 6 User’s Guide page that labels the General cdev pattern popup; the System 7 General Controls figure is the Apple-documented desktop-pattern UI that 7.5 then removed.

## 4. `PAT#` 0 and `CURS` 1–4 are the same documented lineage

`GetIndPattern(..., sysPatListID, index)` with `sysPatListID = 0` is the System-file MacPaint list. The 7.5.3 extract has 38 entries. [Apple, GetIndPattern](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-177.html). Byte identity with 6.0.5 was **not** verified.

`GetCursor` constants are `iBeamCursor = 1`, `crossCursor = 2`, `plusCursor = 3`, `watchCursor = 4`. [Apple, GetCursor](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-384.html). The 7.5.3 extract uses those IDs and names. Pixel identity with 6.0.5 was **not** verified. Color cursors are a separate `'crsr'` type via `GetCCursor`. [Apple, GetCCursor](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-387.html).

## 5. Practical extract: what 6.0.5 would add or lose

A 6.0.5 System+Finder extract would give authored 8×8 `PAT#` tiles and no 7.5 Desktop Patterns suitcase. That matters because a `PixPat`’s `pat1Data` (the 1-bit fallback for a basic `GrafPort`) is initialized to 50% gray. [Apple, PixPat](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-208.html); [Apple, NewPixPat](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-247.html). In the 7.5.3 Desktop Patterns dump, 17 of 74 `ppat`s carry `aa55aa55aa55aa55` and 16 carry all-zero `pat1Data`; only 7 are 1-bit with a tile. Those are color tiles, not authored 1-bit desktop patterns.

What we would lose relative to the current 7.5.3 catalogs: System 7 folder / alias icon families, more cdev `ICN#`/`ics#` artwork, and the color members (`icl8`, `icl4`, `ppat`, `cicn`, `crsr`) a later `@mockintosh/color-quickdraw` `PixMap` can consume. A Plus-style 6.0.5 install also omits Color/Monitors cdevs and the 32-Bit QuickDraw INIT; a Mac II install includes them as separate files, not as a reason to treat the System file as monochrome-only.

## Image locations (not resource-type sources)

Apple’s four-disk 6.0.5 set (System Tools, Printing Tools, Utilities 1 & 2) is linked from [earlymacintosh.org](https://www.earlymacintosh.org/disk_images.html) to the old Apple Support Area. Internet Archive identifiers that contain 6.0.5 images: `Apple_Macintosh_Imaged_Floppy_Collection_JALLER_2018` (`MacOS 6.0.5 Disk 1`–`4`), and `macintoshsystem6collection`. The current catalogs came from `AppleMacintoshSystem753`.
