// --- Messages from Main Thread to Worker ---

export interface InitMessage {
  type: "init";
  appId: string;
  size: { width: number; height: number };
}

export interface EventMessage {
  type: "event";
  event: {
    kind:
      | "mouseDown"
      | "mouseUp"
      | "mouseMove"
      | "doubleClick"
      | "keyDown"
      | "keyUp";
    x?: number;
    y?: number;
    key?: string;
    code?: string;
  };
}

export interface RenderRequest {
  type: "render";
}

export interface OSServiceResponse {
  type: "osServiceResponse";
  requestId: string;
  result: any;
}

export interface HitRegionEventMessage {
  type: "hitRegionEvent";
  regionId: string;
  handler: string;
  x?: number;
  y?: number;
}

export type MainToWorkerMessage =
  | InitMessage
  | EventMessage
  | RenderRequest
  | OSServiceResponse
  | HitRegionEventMessage;

// --- Messages from Worker to Main Thread ---

export interface DrawCommand {
  op:
    | "clear"
    | "rect"
    | "fill"
    | "fillPattern"
    | "hline"
    | "vline"
    | "text"
    | "textBlock"
    | "img"
    | "invert"
    | "pixel"
    | "dottedHLine"
    | "hitRegion";
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  color?: number;
  pattern?: string;
  text?: string;
  font?: string;
  align?: string;
  src?: string;
  maxWidth?: number;
  lineSpacing?: number;
  regionId?: string;
  handlers?: string[];
}

export interface RenderResponse {
  type: "draw";
  commands: DrawCommand[];
}

export interface StateChangeNotification {
  type: "stateChanged";
}

export interface OSServiceRequest {
  type: "osServiceRequest";
  requestId: string;
  service: string;
  method: string;
  args: any[];
}

export type WorkerToMainMessage =
  | RenderResponse
  | StateChangeNotification
  | OSServiceRequest;
