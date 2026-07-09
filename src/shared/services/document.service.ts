import { api } from "@/core/http/api";
import type {
  DocumentActionHandler,
  OpenDocumentOptions,
} from "@/shared/types/document.types";

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function openDocumentUrl(url: string, newTab: boolean): void {
  if (isMobileDevice() || !newTab) {
    window.location.href = url;

    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export async function view(options?: OpenDocumentOptions): Promise<void> {
  let documentUrl = options?.url;
  let shouldRevokeUrl = false;

  if (options?.blob) {
    documentUrl = URL.createObjectURL(options.blob);
    shouldRevokeUrl = true;
  }

  if (!documentUrl) {
    throw new Error("Document view requires blob or url");
  }

  openDocumentUrl(documentUrl, options?.newTab ?? true);

  if (shouldRevokeUrl) {
    setTimeout(() => {
      URL.revokeObjectURL(documentUrl);
    }, 5000);
  }
}

export async function download(options?: OpenDocumentOptions): Promise<void> {
  let file: Blob;

  if (options?.blob) {
    file = options.blob;
  } else if (options?.url) {
    const response = await api.get<Blob>(options.url, {
      responseType: "blob",
    });

    file = response.data;
  } else {
    throw new Error("Document download requires blob or url");
  }

  const filename = options.filename ?? "document.pdf";
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export async function print(options?: OpenDocumentOptions): Promise<void> {
  let file: Blob;

  if (options?.blob) {
    file = options.blob;
  } else if (options?.url) {
    const response = await api.get<Blob>(options.url, {
      responseType: "blob",
    });

    file = response.data;
  } else {
    throw new Error("Document print requires blob or url");
  }

  const documentUrl = URL.createObjectURL(file);

  if (isMobileDevice() || typeof window.print !== "function") {
    openDocumentUrl(documentUrl, true);

    setTimeout(() => {
      URL.revokeObjectURL(documentUrl);
    }, 5000);

    return;
  }

  const printWindow = window.open(documentUrl, "_blank");

  if (!printWindow) {
    URL.revokeObjectURL(documentUrl);

    throw new Error("Document print window blocked");
  }

  const openedPrintWindow = printWindow;

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

    window.setTimeout(startPrint, 1500);

    window.setTimeout(() => {
      revokeObjectUrl();
    }, 30000);
  });
}

export async function share(options?: OpenDocumentOptions): Promise<void> {
  let fileBlob: Blob;

  if (options?.blob) {
    fileBlob = options.blob;
  } else if (options?.url) {
    const response = await api.get<Blob>(options.url, {
      responseType: "blob",
    });

    fileBlob = response.data;
  } else {
    throw new Error("Document share requires blob or url");
  }

  const filename = options.filename ?? "document.pdf";
  const file = new File([fileBlob], filename, {
    type: fileBlob.type || "application/pdf",
  });
  const shareData: ShareData = {
    files: [file],
    title: options.title ?? filename,
    text: options.text,
  };

  if (navigator.share && navigator.canShare?.(shareData)) {
    await navigator.share(shareData);

    return;
  }

  if (options?.shareFallback === "view") {
    await view({
      ...options,
      blob: fileBlob,
    });

    return;
  }

  await download({
    ...options,
    blob: fileBlob,
    filename,
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