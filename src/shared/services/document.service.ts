import { api } from "@/core/http/api";
import type {
  DocumentActionHandler,
  OpenDocumentOptions,
} from "@/shared/types/document.types";

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export class DocumentError extends Error {
  constructor(
    public readonly code:
      | "fetch-failed"
      | "empty-pdf"
      | "invalid-pdf"
      | "popup-blocked"
      | "share-unavailable",
    message: string,
  ) {
    super(message);
    this.name = "DocumentError";
  }
}

export async function getPdfBlob(options?: OpenDocumentOptions): Promise<Blob> {
  let blob: Blob;

  if (options?.blob) {
    blob = options.blob;
  } else if (options?.url) {
    try {
      const response = await api.get<unknown>(options.url, {
        responseType: "blob",
      });

      if (!(response.data instanceof Blob)) {
        throw new DocumentError(
          "invalid-pdf",
          "O documento recebido não é um PDF válido.",
        );
      }

      blob = response.data;
    } catch (error: unknown) {
      if (error instanceof DocumentError) {
        throw error;
      }

      const response =
        typeof error === "object" && error !== null && "response" in error
          ? error.response
          : undefined;
      const status =
        typeof response === "object" &&
        response !== null &&
        "status" in response
          ? response.status
          : undefined;
      throw new DocumentError(
        "fetch-failed",
        status === 401 || status === 403
          ? "Sua sessão não permite obter o PDF. Entre novamente e tente pela listagem."
          : "Não foi possível buscar o PDF. Verifique a conexão e tente novamente.",
      );
    }
  } else {
    throw new DocumentError(
      "invalid-pdf",
      "Informe o documento que deseja abrir.",
    );
  }

  if (blob.size === 0) {
    throw new DocumentError(
      "empty-pdf",
      "O PDF recebido está vazio. Tente obter o documento novamente.",
    );
  }

  const mime = blob.type.split(";")[0].trim().toLowerCase();
  const isPdfEndpoint = /\/pdf(?:[?#]|$)|\/relatorio-pdf(?:[?#]|$)/i.test(
    options?.url ?? "",
  );
  const isPdfFilename = /\.pdf$/i.test(options?.filename ?? "");
  const signature = await blob.slice(0, 5).text();
  const canNormalizeMime =
    (mime === "" || mime === "application/octet-stream") &&
    (isPdfEndpoint || isPdfFilename);

  if (
    signature !== "%PDF-" ||
    (mime !== "application/pdf" && !canNormalizeMime)
  ) {
    throw new DocumentError(
      "invalid-pdf",
      "O documento recebido não é um PDF válido. Tente novamente.",
    );
  }

  return mime === "application/pdf"
    ? blob
    : new Blob([blob], { type: "application/pdf" });
}

export async function preparePdfFile(
  options: OpenDocumentOptions,
): Promise<File> {
  const blob = await getPdfBlob(options);
  return new File([blob], options.filename ?? "document.pdf", {
    type: "application/pdf",
  });
}

export function canSharePdfFile(file: File): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}

export async function sharePdfFile(
  file: File,
  title?: string,
  text?: string,
): Promise<void> {
  if (!canSharePdfFile(file)) {
    throw new DocumentError(
      "share-unavailable",
      "Este dispositivo não permite compartilhar este PDF. Baixe o arquivo e anexe no WhatsApp.",
    );
  }

  // No fetch/await before the native call: the file is already prepared.
  await navigator.share({ files: [file], title: title ?? file.name, text });
}

export async function view(options?: OpenDocumentOptions): Promise<void> {
  const newTab = (options?.newTab ?? true) && !isMobileDevice();
  // Reserve the tab during the click, before the authenticated request.
  const openedWindow = newTab ? window.open("", "_blank") : null;

  if (newTab && !openedWindow) {
    throw new DocumentError(
      "popup-blocked",
      "O navegador bloqueou o PDF. Permita pop-ups e tente novamente.",
    );
  }

  if (openedWindow) {
    openedWindow.opener = null;
  }

  try {
    const blob = await getPdfBlob(options);
    const documentUrl = URL.createObjectURL(blob);

    if (openedWindow) {
      openedWindow.location.replace(documentUrl);
    } else {
      window.location.href = documentUrl;
    }

    setTimeout(() => URL.revokeObjectURL(documentUrl), 60000);
  } catch (error: unknown) {
    openedWindow?.close();
    throw error;
  }
}

export async function download(options?: OpenDocumentOptions): Promise<void> {
  const file = await getPdfBlob(options);
  const filename = options?.filename ?? "document.pdf";
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function print(options?: OpenDocumentOptions): Promise<void> {
  if (isMobileDevice() || typeof window.print !== "function") {
    await view(options);
    return;
  }

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new DocumentError(
      "popup-blocked",
      "O navegador bloqueou a impressão. Permita pop-ups e tente novamente.",
    );
  }

  const openedPrintWindow = printWindow;
  openedPrintWindow.opener = null;
  let file: Blob;

  try {
    file = await getPdfBlob(options);
  } catch (error: unknown) {
    openedPrintWindow.close();
    throw error;
  }

  const documentUrl = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    let printStarted = false;
    let objectUrlRevoked = false;

    function revokeObjectUrl() {
      if (objectUrlRevoked) {
        return;
      }

      objectUrlRevoked = true;
      URL.revokeObjectURL(documentUrl);
    }

    function closePrintWindow() {
      if (!openedPrintWindow.closed) {
        openedPrintWindow.close();
      }
    }

    function startPrint() {
      if (printStarted) {
        return;
      }

      printStarted = true;

      try {
        openedPrintWindow.focus();
        openedPrintWindow.print();
        resolve();
      } catch (error) {
        revokeObjectUrl();
        reject(error);
      }
    }

    openedPrintWindow.addEventListener(
      "load",
      () => {
        window.setTimeout(startPrint, 250);
      },
      {
        once: true,
      },
    );

    openedPrintWindow.addEventListener(
      "afterprint",
      () => {
        revokeObjectUrl();
        closePrintWindow();
      },
      {
        once: true,
      },
    );

    openedPrintWindow.location.replace(documentUrl);

    window.setTimeout(startPrint, 1500);

    window.setTimeout(() => {
      revokeObjectUrl();
    }, 30000);
  });
}

export async function share(options?: OpenDocumentOptions): Promise<void> {
  let file: File;

  if (options?.blob) {
    const blob = options.blob;
    const mime = blob.type.split(";")[0].trim().toLowerCase();
    const canNormalizeMime =
      (mime === "" || mime === "application/octet-stream") &&
      /\.pdf$/i.test(options.filename ?? "");

    if (blob.size === 0) {
      throw new DocumentError("empty-pdf", "O PDF recebido está vazio.");
    }

    if (mime !== "application/pdf" && !canNormalizeMime) {
      throw new DocumentError(
        "invalid-pdf",
        "O documento recebido não possui um tipo compatível com PDF.",
      );
    }

    // Prepared blobs retain the click gesture. These synchronous checks do not
    // validate the PDF signature; do not read the content before native share.
    file = new File([blob], options.filename ?? "document.pdf", {
      type: "application/pdf",
    });
  } else {
    // URL preparation is asynchronous and cannot guarantee user activation.
    file = await preparePdfFile(options ?? {});
  }

  if (canSharePdfFile(file)) {
    await sharePdfFile(file, options?.title, options?.text);

    return;
  }

  if (options?.shareFallback === "view") {
    await view({
      ...options,
      blob: file,
    });

    return;
  }

  await download({
    ...options,
    blob: file,
    filename: file.name,
  });
}

export const documentService: Record<
  "view" | "download" | "print" | "share",
  DocumentActionHandler
> = {
  view,
  download,
  print,
  share,
};
