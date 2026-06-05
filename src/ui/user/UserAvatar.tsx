"use client";

import { motion } from "framer-motion";

export function UserAvatar({ name }: { name?: string }) {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="
        group relative

        w-10 h-10

        sm:w-9 sm:h-9

        flex items-center justify-center

        rounded-full

        border border-[color:var(--border-soft)]
        group-hover:border-red-200
        bg-[color:var(--surface-100)]

        text-[13px] sm:text-[12px] font-semibold
        text-[color:var(--foreground)]

        shadow-[0_6px_20px_rgba(0,0,0,0.06)]

        transition-all duration-200

        hover:shadow-[0_12px_34px_rgba(239,68,68,0.12)]
        hover:border-[color:var(--border-strong)]
      "
    >
      {/* GLOW */}
      <div
        className="
        absolute inset-0 opacity-0 group-hover:opacity-100 transition
        bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.06),transparent_70%)]
        rounded-full
      "
      />

      <div
        className="
    absolute

    top-[2px]
    right-[2px]

    w-2
    h-2

    rounded-full

    bg-emerald-500

    border

    border-white
  "
      />

      <span
        className="
    relative

    text-[11px]
    sm:text-[10px]

    font-bold

    tracking-tight
  "
      >
        HMN
      </span>
    </motion.div>
  );
}
