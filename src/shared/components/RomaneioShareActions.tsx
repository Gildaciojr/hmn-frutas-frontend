"use client";

import { useRef, useState } from "react";
import {
  Download,
  FileText,
  LoaderCircle,
  MessageCircleMore,
  Share2,
  X,
} from "lucide-react";
import {
  canSharePdfFile,
  DocumentError,
  download,
  preparePdfFile,
  sharePdfFile,
} from "@/shared/services/document.service";
import {
  getWhatsappUrl,
  openWhatsappUrl,
} from "@/modules/whatsapp/utils/whatsapp-phone";

export interface RomaneioShareActionsProps {
  documentUrl: string;
  filename: string;
  title: string;
  destinatarioNome: string;
  destinatarioTelefone?: string | null;
  contexto: "VENDA" | "COMPRA";
  disabled?: boolean;
  onClose?: () => void;
}

export function RomaneioShareActions({
  documentUrl,
  filename,
  title,
  destinatarioNome,
  destinatarioTelefone,
  contexto,
  disabled = false,
  onClose,
}: RomaneioShareActionsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [shareSupported, setShareSupported] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    error: boolean;
  } | null>(null);
  const busyRef = useRef(false);
  const whatsappUrl = getWhatsappUrl(destinatarioTelefone);
  const recipientLabel = contexto === "VENDA" ? "Cliente" : "Fornecedor";
  const buttonClass =
    "inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs";

  function reportError(error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      setFeedback({
        message:
          "Compartilhamento cancelado. Você pode tentar novamente quando quiser.",
        error: false,
      });
      return;
    }

    setFeedback({
      message:
        error instanceof DocumentError
          ? error.message
          : "Não foi possível compartilhar o PDF. Tente novamente ou baixe o arquivo e anexe no WhatsApp.",
      error: !(
        error instanceof DocumentError && error.code === "share-unavailable"
      ),
    });
  }

  async function prepareDocument(): Promise<File> {
    const preparedFile = await preparePdfFile({ url: documentUrl, filename });
    setFile(preparedFile);
    setShareSupported(canSharePdfFile(preparedFile));
    return preparedFile;
  }

  async function handleShare() {
    if (disabled || busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setFeedback(null);

    try {
      if (!file) {
        const preparedFile = await prepareDocument();
        setFeedback({
          message: canSharePdfFile(preparedFile)
            ? "PDF pronto. Toque novamente em Compartilhar PDF para escolher o aplicativo e o contato."
            : "Este dispositivo não permite compartilhar este PDF. Baixe o arquivo e anexe na conversa do WhatsApp.",
          error: false,
        });
        return;
      }

      // This invocation happens in the new click, with no pending PDF request.
      await sharePdfFile(file, title);
      setFeedback({
        message:
          "PDF disponibilizado para compartilhamento. O ERP não confirma o envio ao destinatário.",
        error: false,
      });
    } catch (error: unknown) {
      reportError(error);
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (disabled || busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setFeedback(null);

    try {
      const preparedFile = file ?? (await prepareDocument());
      await download({ blob: preparedFile, filename });
      setFeedback({
        message:
          "Download iniciado. Abra o WhatsApp e anexe o PDF na conversa.",
        error: false,
      });
    } catch (error: unknown) {
      setFeedback({
        message:
          error instanceof DocumentError
            ? error.message
            : "Não foi possível baixar o PDF. Tente novamente.",
        error: true,
      });
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }

  function handleWhatsapp() {
    if (disabled || !whatsappUrl) return;

    try {
      openWhatsappUrl(whatsappUrl);
      setFeedback({
        message:
          "Conversa aberta. Anexe o PDF manualmente; abrir o WhatsApp não envia o documento.",
        error: false,
      });
    } catch (error: unknown) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível abrir o WhatsApp.",
        error: true,
      });
    }
  }

  return (
    <section
      aria-label={`Ações do romaneio de ${contexto === "VENDA" ? "venda" : "compra"}`}
      className="w-full min-w-0 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-slate-700 sm:p-4"
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <FileText size={17} className="shrink-0" />
            {title}
          </p>
          <p className="break-words text-xs">
            {recipientLabel}:{" "}
            <span className="font-medium">{destinatarioNome}</span>
          </p>
          {destinatarioTelefone?.trim() && (
            <p className="break-all text-xs text-slate-500">
              {destinatarioTelefone}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar ações do romaneio"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl hover:bg-emerald-100"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={disabled || loading || shareSupported === false}
          className={`${buttonClass} border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700`}
        >
          {loading ? (
            <LoaderCircle size={16} className="shrink-0 animate-spin" />
          ) : (
            <Share2 size={16} className="shrink-0" />
          )}
          {loading ? "Preparando documento…" : "Compartilhar PDF"}
        </button>
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={disabled || loading}
          className={`${buttonClass} border-emerald-200 bg-white hover:bg-emerald-50`}
        >
          <Download size={16} className="shrink-0" />
          Baixar PDF
        </button>
        <button
          type="button"
          onClick={handleWhatsapp}
          disabled={disabled || !whatsappUrl}
          className={`${buttonClass} border-emerald-200 bg-white hover:bg-emerald-50`}
        >
          <MessageCircleMore size={16} className="shrink-0" />
          Abrir WhatsApp
        </button>
      </div>
      {!whatsappUrl && (
        <p className="text-xs text-amber-800">
          {destinatarioTelefone?.trim()
            ? "Telefone inválido para abrir o WhatsApp."
            : "Telefone não cadastrado."}{" "}
          O PDF continua disponível para compartilhar ou baixar.
        </p>
      )}
      <p className="text-xs leading-relaxed text-slate-500">
        O primeiro clique prepara o PDF; quando estiver pronto, toque novamente
        para compartilhar. No desktop/WhatsApp Web, baixe e anexe o arquivo
        manualmente. Abrir a conversa não anexa o PDF.
      </p>
      {feedback && (
        <p
          role={feedback.error ? "alert" : "status"}
          className={`break-words rounded-xl px-3 py-2 text-xs leading-relaxed ${feedback.error ? "bg-red-50 text-red-700" : "bg-white text-emerald-800"}`}
        >
          {feedback.message}
        </p>
      )}
    </section>
  );
}
