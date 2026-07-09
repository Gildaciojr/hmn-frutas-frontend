export interface OpenDocumentOptions {
  filename?: string;
  blob?: Blob;
  url?: string;
  newTab?: boolean;
  title?: string;
  text?: string;
  shareFallback?: "download" | "view";
}

export type DocumentActionHandler = (
  options?: OpenDocumentOptions,
) => Promise<void>;

export interface UseDocumentActionsResult {
  view: DocumentActionHandler;
  download: DocumentActionHandler;
  print: DocumentActionHandler;
  share: DocumentActionHandler;
}