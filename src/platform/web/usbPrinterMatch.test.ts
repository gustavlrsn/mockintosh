import { describe, expect, it } from "vitest";
import { findPrinterEndpoint, usbDeviceLabel } from "./usbPrinterMatch";

type Endpoint = Pick<USBEndpoint, "endpointNumber" | "direction" | "type">;

function iface(interfaceNumber: number, interfaceClass: number, endpoints: Endpoint[]): USBInterface {
  const alt = {
    alternateSetting: 0,
    interfaceClass,
    interfaceSubclass: 0,
    interfaceProtocol: 0,
    endpoints: endpoints.map((e) => ({ ...e, packetSize: 64 })),
  };
  return { interfaceNumber, alternate: alt, alternates: [alt], claimed: false };
}

function device(...interfaces: USBInterface[]): Pick<USBDevice, "configuration" | "configurations"> {
  const configuration = { configurationValue: 1, interfaces };
  return { configuration: null, configurations: [configuration] };
}

const BULK_OUT: Endpoint = { endpointNumber: 2, direction: "out", type: "bulk" };
const BULK_IN: Endpoint = { endpointNumber: 1, direction: "in", type: "bulk" };
const INTERRUPT_IN: Endpoint = { endpointNumber: 3, direction: "in", type: "interrupt" };

describe("findPrinterEndpoint", () => {
  it("finds the bulk OUT endpoint of a printer-class interface", () => {
    expect(findPrinterEndpoint(device(iface(0, 0x07, [BULK_IN, BULK_OUT])))).toEqual({
      configurationValue: 1,
      interfaceNumber: 0,
      alternateSetting: 0,
      interfaceClass: 0x07,
      endpointNumber: 2,
      inEndpointNumber: 1,
    });
  });

  it("accepts vendor-specific printers, including write-only ones", () => {
    expect(findPrinterEndpoint(device(iface(0, 0xff, [BULK_OUT])))).toMatchObject({
      interfaceNumber: 0,
      inEndpointNumber: null,
    });
  });

  it("prefers the printer interface on a composite device", () => {
    const composite = device(
      iface(0, 0xff, [{ ...BULK_OUT, endpointNumber: 5 }]),
      iface(1, 0x07, [BULK_OUT]),
    );
    expect(findPrinterEndpoint(composite)).toMatchObject({ interfaceNumber: 1, endpointNumber: 2 });
  });

  it("rejects devices without a bulk OUT endpoint, like a mouse", () => {
    expect(findPrinterEndpoint(device(iface(0, 0x03, [INTERRUPT_IN])))).toBeNull();
    expect(findPrinterEndpoint(device(iface(0, 0xff, [BULK_IN])))).toBeNull();
  });

  it("rejects mass storage even though it has bulk OUT", () => {
    expect(findPrinterEndpoint(device(iface(0, 0x08, [BULK_IN, BULK_OUT])))).toBeNull();
  });
});

describe("usbDeviceLabel", () => {
  it("uses the product name the picker shows", () => {
    expect(usbDeviceLabel({ productName: "POS-80", vendorId: 0x0416, productId: 0x5011 })).toBe("POS-80");
  });

  it("falls back to vendor and product ids", () => {
    expect(usbDeviceLabel({ vendorId: 0x0416, productId: 0x5011 })).toBe("USB device 0416:5011");
  });
});
