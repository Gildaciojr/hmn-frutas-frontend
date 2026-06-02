"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import {
  Loader2,
  MessageCircleMore,
} from "lucide-react";

import { getWhatsappResumoCliente } from "../services/whatsapp.service";

// ======================================================
// TYPES
// ======================================================

interface Props {
  clienteId: string;
}

// ======================================================
// COMPONENT
// ======================================================

export function WhatsappButton({
  clienteId,
}: Props) {
  // ====================================================
  // STATES
  // ====================================================

  const [loading, setLoading] =
    useState(false);

  // ====================================================
  // HANDLE OPEN
  // ====================================================

  async function handleOpenWhatsapp(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.stopPropagation();

    try {
      setLoading(true);

      // ================================================
      // BACKEND
      // ================================================

      const data =
        await getWhatsappResumoCliente(
          clienteId,
        );

      // ================================================
      // OPEN
      // ================================================

      window.open(
        data.whatsappUrl,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      console.error(
        "Erro ao abrir WhatsApp:",
        error,
      );

      alert(
        "Não foi possível abrir o WhatsApp deste cliente.",
      );
    } finally {
      setLoading(false);
    }
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

      title="Enviar resumo via WhatsApp"

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
        {loading ? (
          <Loader2
            size={16}
            className="animate-spin"
          />
        ) : (
          <MessageCircleMore size={16} />
        )}
      </div>
    </motion.button>
  );
}