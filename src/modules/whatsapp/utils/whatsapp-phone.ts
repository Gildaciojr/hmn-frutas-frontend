export function normalizeWhatsappPhone(
  telefone: string | null | undefined,
): string | null {
  if (!telefone?.trim()) {
    return null;
  }

  const digits = telefone.replace(/\D/g, "").replace(/^0+/, "");

  if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith("55")
  ) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return null;
}

export function getWhatsappUrl(
  telefone: string | null | undefined,
  mensagem?: string,
): string | null {
  const digits = normalizeWhatsappPhone(telefone);

  if (!digits) {
    return null;
  }

  const url = `https://wa.me/${digits}`;

  return mensagem ? `${url}?text=${encodeURIComponent(mensagem)}` : url;
}

export function openWhatsappUrl(url: string): void {
  // Retain the handle to detect blocked popups, then remove access to the ERP.
  const openedWindow = window.open("", "_blank");

  if (!openedWindow) {
    throw new Error(
      "O navegador bloqueou a janela. Permita pop-ups e tente novamente.",
    );
  }

  openedWindow.opener = null;
  const referrerPolicy = openedWindow.document.createElement("meta");
  referrerPolicy.name = "referrer";
  referrerPolicy.content = "no-referrer";
  openedWindow.document.head.appendChild(referrerPolicy);
  const link = openedWindow.document.createElement("a");
  link.href = url;
  link.rel = "noopener noreferrer";
  link.referrerPolicy = "no-referrer";
  openedWindow.document.body.appendChild(link);
  link.click();
}
