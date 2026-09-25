import type { PrinterEncoder, PrinterProfile } from "./encoder";
import { CatPrinterEncoder } from "./catPrinter";
import { EscPosEncoder, type EscPosEncoderOptions } from "./escpos";

/** The ESC/POS encoder settings a profile carries. */
export function escPosOptionsForProfile(profile: PrinterProfile): EscPosEncoderOptions {
  return {
    cutCommand: profile.cutCommand,
    rasterBandRows: profile.rasterBandRows,
    rasterLeadInRows: profile.rasterLeadInRows,
    tuning: profile.tuning,
  };
}

/** Build the encoder a profile names. The transport is chosen separately. */
export function encoderForProfile(profile: PrinterProfile): PrinterEncoder {
  return profile.dialect === "cat" ? new CatPrinterEncoder() : new EscPosEncoder(escPosOptionsForProfile(profile));
}
