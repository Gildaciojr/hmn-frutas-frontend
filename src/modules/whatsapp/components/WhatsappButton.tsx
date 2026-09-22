"use client";

import { motion } from "framer-motion";

import {
  MessageCircleMore,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

interface Props {
  telefone?: string | null;
}

function normalizeWhatsappPhone(
  telefone: string | null | undefined,
): string | null {
  if (!telefone?.trim()) {
    return null;
  }

  const rawDigits = telefone.replace(/\D/g, "");

  if (!rawDigits) {
    return null;
  }

  const digits = rawDigits.replace(/^0+/, "");

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

// ======================================================
// COMPONENT
// ======================================================

export function WhatsappButton({
  telefone,
}: Props) {
  // ====================================================
  // HANDLE OPEN
  // ====================================================

  function handleOpenWhatsapp(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();

    const normalizedPhone = normalizeWhatsappPhone(telefone);

    if (!normalizedPhone) {
      alert(
        "Este cliente não possui um telefone válido cadastrado.",
      );

      return;
    }

    window.open(
      `https://wa.me/${normalizedPhone}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <motion.button
      whileHover={{
        scale: 1.04,
        y: -1,
      }}

      whileTap={{
        scale: 0.96,
      }}

      onClick={handleOpenWhatsapp}

      title="Abrir conversa no WhatsApp"

      className="
        group

        relative

        flex items-center justify-center

        w-9 h-9

        rounded-xl

        border border-emerald-200/70

        bg-[linear-gradient(180deg,#ffffff,#f4fff7)]

        text-emerald-600

        shadow-[0_10px_25px_rgba(16,185,129,0.10)]

        hover:border-emerald-300
        hover:text-emerald-700

        hover:shadow-[0_16px_40px_rgba(16,185,129,0.18)]

        transition-all duration-300

        overflow-hidden
      "
    >
      {/* ============================================= */}
      {/* GLOW */}
      {/* ============================================= */}

      <div
        className="
          absolute inset-0

          opacity-0

          group-hover:opacity-100

          transition duration-300

          bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_72%)]
        "
      />

      {/* ============================================= */}
      {/* INNER LIGHT */}
      {/* ============================================= */}

      <div
        className="
          absolute inset-x-0 top-0 h-[1px]

          bg-gradient-to-r
          from-transparent
          via-white/80
          to-transparent

          opacity-70
        "
      />

      {/* ============================================= */}
      {/* CONTENT */}
      {/* ============================================= */}

      <div className="relative z-10">
        <MessageCircleMore size={16} />
      </div>
    </motion.button>
  );
}
