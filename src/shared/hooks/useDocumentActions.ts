import { documentService } from "@/shared/services/document.service";

export type {
  DocumentActionHandler,
  OpenDocumentOptions,
  UseDocumentActionsResult,
} from "@/shared/types/document.types";

import type { UseDocumentActionsResult } from "@/shared/types/document.types";

export function useDocumentActions(): UseDocumentActionsResult {
  return {
    view: documentService.view,
    download: documentService.download,
    print: documentService.print,
    share: documentService.share,
  };
}