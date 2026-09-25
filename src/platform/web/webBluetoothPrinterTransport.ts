/**
 * Web Bluetooth transport so a BLE thermal printer can be used from Chrome.
 *
 * The picker offers every service the known printer drivers write through
 * (and their name prefixes); once connected, the first of those services the
 * device actually has is used. A printer chosen before is reconnected without
 * the picker where the browser supports `bluetooth.getDevices()`.
 *
 * Browser-only (Chromium; requires a secure origin and a user gesture to pick).
 */
import {
  PrinterNotConnectedError,
  PrinterUnavailableError,
  PrinterWrongDeviceError,
  bluetoothUuid,
  type BluetoothGattProfile,
  type PrinterIdentity,
  type PrinterTransport,
} from "@mockintosh/print";
import { pickPrinterDevice } from "./devicePicker";

interface BluetoothCharacteristic {
  writeValueWithResponse(value: Uint8Array): Promise<void>;
}

interface BluetoothService {
  getCharacteristic(uuid: string): Promise<BluetoothCharacteristic>;
}

interface BluetoothServer {
  connected: boolean;
  getPrimaryService(uuid: string): Promise<BluetoothService>;
}

interface BluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
    connect(): Promise<BluetoothServer>;
    disconnect(): void;
  };
}

type BluetoothRequestFilter = { services?: string[]; namePrefix?: string };

interface BluetoothApi {
  requestDevice(options: { filters: BluetoothRequestFilter[]; optionalServices?: string[] }): Promise<BluetoothDevice>;
  /** Devices this origin was granted before; not in every Chromium build. */
  getDevices?(): Promise<BluetoothDevice[]>;
}

function bluetoothApi(): BluetoothApi | undefined {
  return typeof navigator !== "undefined" ? (navigator as Navigator & { bluetooth?: BluetoothApi }).bluetooth : undefined;
}

const CHUNK = 180;

export function isWebBluetoothAvailable(): boolean {
  return typeof bluetoothApi()?.requestDevice === "function";
}

export interface WebBluetoothPrinterOptions {
  /** Services a printer may write through, most specific first. */
  gatt: readonly BluetoothGattProfile[];
  /** Also offer devices whose name starts with one of these. */
  namePrefixes?: readonly string[];
  /** The printer chosen earlier, to reconnect without the picker. */
  device?: { id?: string; name?: string };
}

interface Connection {
  device: BluetoothDevice;
  characteristic: BluetoothCharacteristic;
  service: string;
}

export class WebBluetoothPrinterTransport implements PrinterTransport {
  private readonly options: WebBluetoothPrinterOptions;
  private connection: Connection | null = null;
  private readonly listeners = new Set<() => void>();
  private readonly onGattDisconnected = () => this.notify();

  constructor(options: WebBluetoothPrinterOptions) {
    this.options = options;
  }

  get connected(): boolean {
    return this.connection?.device.gatt?.connected === true;
  }

  get deviceName(): string | null {
    if (!this.connected) return null;
    return this.connection?.device.name ?? "Bluetooth printer";
  }

  onStateChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    await this.restore();
    if (!this.connected) await this.use(await this.pick());
  }

  /** Reconnect the remembered printer without the picker, if the browser allows it. */
  async restore(): Promise<void> {
    const id = this.options.device?.id ?? this.connection?.device.id;
    const api = bluetoothApi();
    if (this.connected || !id || !api?.getDevices) return;
    const device = (await api.getDevices()).find((d) => d.id === id);
    if (device) await this.use(device);
  }

  async choose(): Promise<void> {
    const previous = this.connection;
    await this.use(await this.pick());
    if (previous && previous.device !== this.connection?.device) this.drop(previous);
  }

  async forget(): Promise<void> {
    await this.disconnect();
  }

  identity(): PrinterIdentity | null {
    const c = this.connected ? this.connection : null;
    if (!c) return null;
    return {
      link: "bluetooth",
      name: c.device.name ?? null,
      bluetooth: { id: c.device.id, services: [c.service] },
    };
  }

  linkDetails(): string {
    return this.connection ? `Bluetooth, service ${this.connection.service}` : "Not connected";
  }

  private async pick(): Promise<BluetoothDevice> {
    const api = bluetoothApi();
    if (!api || !isWebBluetoothAvailable()) throw new PrinterUnavailableError("Web Bluetooth is not supported here");
    const services = this.options.gatt.map((g) => bluetoothUuid(g.service));
    const filters: BluetoothRequestFilter[] = [
      ...services.map((service) => ({ services: [service] })),
      ...(this.options.namePrefixes ?? []).map((namePrefix) => ({ namePrefix })),
    ];
    return pickPrinterDevice(() => api.requestDevice({ filters, optionalServices: services }));
  }

  /** Connect GATT and find a write characteristic through the first known service the device has. */
  private async use(device: BluetoothDevice): Promise<void> {
    if (!device.gatt) throw new PrinterWrongDeviceError(device.name ?? "Bluetooth device");
    const server = await device.gatt.connect();
    for (const profile of this.options.gatt) {
      const service = bluetoothUuid(profile.service);
      try {
        const characteristic = await (await server.getPrimaryService(service)).getCharacteristic(bluetoothUuid(profile.write));
        if (this.connection?.device !== device) {
          this.connection?.device.removeEventListener("gattserverdisconnected", this.onGattDisconnected);
          device.addEventListener("gattserverdisconnected", this.onGattDisconnected);
        }
        this.connection = { device, characteristic, service };
        return;
      } catch {
        // Not this service; try the next.
      }
    }
    device.gatt.disconnect();
    throw new PrinterWrongDeviceError(device.name ?? "Bluetooth device");
  }

  async write(bytes: Uint8Array): Promise<void> {
    const c = this.connection;
    if (!c || !this.connected) throw new PrinterNotConnectedError();
    for (let offset = 0; offset < bytes.length; offset += CHUNK) {
      await c.characteristic.writeValueWithResponse(bytes.subarray(offset, offset + CHUNK));
    }
  }

  async disconnect(): Promise<void> {
    const c = this.connection;
    this.connection = null;
    if (c) {
      this.drop(c);
      this.notify();
    }
  }

  private drop(c: Connection): void {
    c.device.removeEventListener("gattserverdisconnected", this.onGattDisconnected);
    c.device.gatt?.disconnect();
  }
}
