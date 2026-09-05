/**
 * @mockintosh/print — thermal printing for Mockintosh.
 *
 *   PrintPage (QuickDraw port)  →  EscPosEncoder  →  PrinterTransport
 *
 * Everything here is platform-free. Transports are the platform edge and live
 * with the platform: `WebUSBPrinterTransport` in `src/platform/web` for
 * browsers; a UART transport would serve a microcontroller with the same bytes.
 */
export {
  PrinterNotConnectedError,
  PrinterUnavailableError,
  type PrinterTransport,
} from "./transport";
export { EscPosEncoder, packRows, RASTER_BAND_ROWS, type CutOptions } from "./escpos";
export { createPrintPage, drawOnPage, disposePrintPage, type PrintPage } from "./page";
