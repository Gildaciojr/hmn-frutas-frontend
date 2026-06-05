"use client";

import { AppHeader } from "./AppHeader";

import { AlertRealtimeToast } from "@/ui/notifications/AlertRealtimeToast";

export function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        min-h-dvh

        w-full

        flex
        flex-col

        bg-[color:var(--background)]

        text-[color:var(--foreground)]
      "
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <AppHeader />

      {/* ================================================== */}
      {/* WRAPPER */}
      {/* ================================================== */}

      <div
        className="
          relative

          flex-1

          overflow-visible
        "
      >
        {/* ================================================= */}
        {/* BASE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            inset-0

            bg-[color:var(--background)]
          "
        />

        {/* ================================================= */}
        {/* GLOBAL GRADIENT */}
        {/* ================================================= */}

        <div
          className="
            absolute
            inset-0

            bg-[radial-gradient(circle_at_15%_20%,rgba(0,0,0,0.035),transparent_45%)]
          "
        />

        {/* ================================================= */}
        {/* LIGHT RIGHT */}
        {/* ================================================= */}

        <div
          className="
            absolute

            top-[8%]
            right-[-180px]

            w-[280px]
            h-[280px]

            md:w-[520px]
            md:h-[520px]

            rounded-full

            bg-red-500/5

            blur-[60px]

            md:blur-[80px]

            pointer-events-none
          "
        />

        {/* ================================================= */}
        {/* LIGHT LEFT */}
        {/* ================================================= */}

        <div
          className="
            absolute

            bottom-[0%]
            left-[-200px]

            w-[220px]
            h-[220px]

            md:w-[420px]
            md:h-[420px]

            rounded-full

            bg-black/5

            blur-[60px]

            pointer-events-none
          "
        />

        {/* ================================================= */}
        {/* GRID TEXTURE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            inset-0

            opacity-[0.018]

            md:opacity-[0.012]

            bg-[linear-gradient(rgba(0,0,0,0.4)_1px,transparent_1px),
                linear-gradient(90deg,rgba(0,0,0,0.4)_1px,transparent_1px)]

            bg-[size:52px_52px]

            md:bg-[size:72px_72px]

            pointer-events-none
          "
        />

        {/* ================================================= */}
        {/* BOTTOM FADE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0

            h-[80px]

            md:h-[180px]

            bg-gradient-to-t

            from-[color:var(--background)]
            to-transparent

            pointer-events-none
          "
        />

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <main
          className="
            relative
            z-10

            min-h-full

            overflow-visible

            px-3
            py-3
            sm:py-6
            md:py-8

            transition-colors
            duration-300
          "
        >
          {children}
        </main>

        {/* ================================================= */}
        {/* REALTIME ALERT TOAST */}
        {/* ================================================= */}

        <AlertRealtimeToast />
      </div>
    </div>
  );
}