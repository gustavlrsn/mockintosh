export interface AppCrypto {
  randomBytes(n: number): Uint8Array;
  sha256(bytes: Uint8Array): Promise<Uint8Array>;
}
