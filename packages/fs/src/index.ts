export {
  ROOT_ID,
  MIME,
  type NodeId,
  type NodeRole,
  type FSNode,
  type FSFile,
  type FSDirectory,
  type FSNodeBase,
  type NodeAttributes,
  type AttributeValue,
  type FileContent,
  type WriteFileOptions,
  type KnownMime,
} from "./types";
export { FileSystem, type FileSystemOptions, type MkdirOptions } from "./fileSystem";
export { FSError, isFSError, type FSErrorCode } from "./errors";
export { InMemoryBackend, type FSBackend } from "./backend";
export { inferMimeType, isTextType, extensionOf } from "./mime";
export { CURRENT_CATALOG_VERSION, parseCatalog, type CatalogDocument } from "./catalogDocument";
