/**
 * The subset of the WebUSB API this package uses. TypeScript's `dom` lib does
 * not ship WebUSB declarations; these keep the package free of a `@types`
 * dependency.
 */
interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
  serialNumber?: string;
}

interface USBEndpoint {
  readonly endpointNumber: number;
  readonly direction: "in" | "out";
  readonly type: "bulk" | "interrupt" | "isochronous";
  readonly packetSize: number;
}

interface USBAlternateInterface {
  readonly alternateSetting: number;
  readonly endpoints: readonly USBEndpoint[];
}

interface USBInterface {
  readonly interfaceNumber: number;
  readonly alternate: USBAlternateInterface;
  readonly alternates: readonly USBAlternateInterface[];
  readonly claimed: boolean;
}

interface USBConfiguration {
  readonly configurationValue: number;
  readonly interfaces: readonly USBInterface[];
}

interface USBOutTransferResult {
  readonly bytesWritten: number;
  readonly status: "ok" | "stall" | "babble";
}

interface USBDevice {
  readonly opened: boolean;
  readonly configuration: USBConfiguration | null;
  readonly configurations: readonly USBConfiguration[];
  readonly vendorId: number;
  readonly productId: number;
  readonly productName?: string;
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  transferOut(endpointNumber: number, data: ArrayBufferView | ArrayBuffer): Promise<USBOutTransferResult>;
}

interface USB {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: { filters: USBDeviceFilter[] }): Promise<USBDevice>;
}

interface Navigator {
  readonly usb: USB;
}
