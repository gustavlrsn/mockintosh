export interface BrowserService {
  openExternal(url: string): Promise<void>;
  authorize(url: string, options?: { redirectOrigin?: string }): Promise<Record<string, string>>;
  loadScript(url: string, globalName: string): Promise<unknown>;
}
