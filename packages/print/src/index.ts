/**
 * @mockintosh/print — thermal printing for Mockintosh.
 *
 *   PrintPage (QuickDraw port)  →  PrinterEncoder  →  PrinterTransport
 *
 * Everything here is platform-free. Transports are the platform edge and live
 * with the platform: `WebUSBPrinterTransport` in `src/platform/web` for
 * browsers; BLE / USB-host transports on a microcontroller send the same bytes.
 */
export {
  PrinterCancelledError,
  PrinterNotConnectedError,
  PrinterUnavailableError,
  PrinterWrongDeviceError,
  type PrinterLinkRequest,
  type PrinterLinks,
  type PrinterTransport,
} from "./transport";
export {
  ESCPOS_CUT_COMMANDS,
  ESCPOS_TUNING_PRESETS,
  PROFILE_CAT_58MM,
  PROFILE_ESCPOS_58MM,
  PROFILE_ESCPOS_80MM,
  profileById,
  type CutOptions,
  type EscPosCutCommand,
  type EscPosPrintTuning,
  type EscPosTuningPreset,
  type PrinterDialect,
  type PrinterEncoder,
  type PrinterProfile,
} from "./encoder";
export { encoderForProfile, escPosOptionsForProfile } from "./factory";
export {
  ESCPOS_SELF_TEST,
  LOAD_TEST_FRACTIONS,
  WIDTH_TEST_DOTS,
  cutTestBytes,
  loadBlockBitmap,
  loadTestBytes,
  testPageBytes,
  tuningSampleBitmap,
  tuningSampleBytes,
  widthStripBitmap,
  widthTestBytes,
} from "./testPage";
export {
  BUILTIN_PRINTER_DRIVERS,
  DRIVER_CAT_58MM,
  DRIVER_ESCPOS_58MM,
  DRIVER_ESCPOS_58MM_18F0,
  DRIVER_ESCPOS_80MM,
  DRIVER_MASUNG_MS_EP8300,
  GATT_CAT_AE30,
  GATT_ESCPOS_18F0,
  GATT_ESCPOS_FF00,
  bluetoothUuid,
  describePrinterIdentity,
  deviceRefOf,
  driverForProfile,
  matchPrinterDrivers,
  type BluetoothGattProfile,
  type PrinterDensityCommand,
  type PrinterDensityControl,
  type PrinterDeviceRef,
  type PrinterSpeed,
  type PrinterSpeedCommand,
  type PrinterSpeedControl,
  type PrinterSpeedLevel,
  type PrinterDriver,
  type PrinterDriverCandidate,
  type PrinterDriverMatch,
  type PrinterIdentity,
  type PrinterLinkKind,
} from "./driver";
export {
  PRINTER_DRIVER_FORMAT,
  PRINTER_DRIVER_VERSION,
  PrinterDriverFileError,
  parsePrinterDriver,
  parsePrinterDriverText,
  printerDriverToJSON,
} from "./driverFile";
export { identifyPrinter, type IdentifyPrinterOptions } from "./identify";
export {
  ESCPOS_RECOVER_AND_CLEAR,
  ESCPOS_STATUS,
  describePrinterStatus,
  escPosStatusQuery,
  isEscPosStatusByte,
  parseDeviceId,
  parseEscPosStatus,
  parsePortStatus,
  queryPrinterStatus,
  type EscPosStatus,
  type EscPosStatusQuery,
  type PrinterDeviceId,
  type PrinterPortStatus,
  type PrinterStatusReport,
} from "./status";
export {
  describeProbeResults,
  probeMasung,
  probePrinterId,
  probeUserSettings,
  reportedIdentity,
  type DescribeProbeOptions,
  type PrinterIdField,
  type PrinterProbeResult,
} from "./probe";
export {
  ESCPOS_DENSITY_RANGE,
  ESCPOS_USER_SETTING,
  gsParenE,
  readUserSettingBytes,
  setUserSettingBytes,
  writeUserSetting,
} from "./userSettings";
export {
  PRINTER_DENSITY_SCALES,
  densityLevelName,
  writePrinterDensity,
  type PrinterDensityScale,
  type PrinterDensityStep,
} from "./density";
export { PRINTER_SPEEDS, writePrinterSpeed } from "./printSpeed";
export { MASUNG_DENSITY_RANGE, masungDensityBytes, masungSpeedBytes } from "./masung";
export { EscPosEncoder, packRows, RASTER_BAND_ROWS, type EscPosEncoderOptions } from "./escpos";
export { CatPrinterEncoder, catFrame, crc8 } from "./catPrinter";
export { createPrintPage, drawOnPage, disposePrintPage, type PrintPage } from "./page";
