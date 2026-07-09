"use client";

export interface DocumentActionsProps {
  onView?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  showView?: boolean;
  showDownload?: boolean;
  showPrint?: boolean;
  showShare?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

type DocumentAction = {
  key: "view" | "download" | "print" | "share";
  label: string;
  show: boolean;
  onClick?: () => void;
};

export function DocumentActions({
  onView,
  onDownload,
  onPrint,
  onShare,
  showView,
  showDownload,
  showPrint,
  showShare,
  disabled = false,
  loading = false,
}: DocumentActionsProps) {
  const actions: DocumentAction[] = [
    {
      key: "view",
      label: "Visualizar",
      show: showView ?? Boolean(onView),
      onClick: onView,
    },
    {
      key: "download",
      label: "Baixar",
      show: showDownload ?? Boolean(onDownload),
      onClick: onDownload,
    },
    {
      key: "print",
      label: "Imprimir",
      show: showPrint ?? Boolean(onPrint),
      onClick: onPrint,
    },
    {
      key: "share",
      label: "Compartilhar",
      show: showShare ?? Boolean(onShare),
      onClick: onShare,
    },
  ];

  const visibleActions = actions.filter((action) => action.show);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleActions.map((action) => {
        const isDisabled = disabled || loading || !action.onClick;

        return (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            disabled={isDisabled}
            className="
              inline-flex
              h-[40px]
              items-center
              justify-center
              rounded-[14px]
              border border-[color:var(--border-soft)]
              bg-[color:var(--surface-200)]
              px-4
              text-[12px]
              font-medium
              text-[color:var(--foreground)]
              transition
              hover:border-[color:var(--border-strong)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
