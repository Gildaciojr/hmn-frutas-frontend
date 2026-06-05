"use client";

import { useRouter } from "next/navigation";

import Image from "next/image";

import { motion } from "framer-motion";

import { LogIn } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div
      className="
        relative

        min-h-dvh
        w-full

        overflow-hidden

        bg-[color:var(--background)]
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="absolute inset-0 bg-[color:var(--background)]" />

      <div
        className="
          absolute

          top-[-80px]
          left-[-80px]

          w-[320px]
          h-[320px]

          md:w-[520px]
          md:h-[520px]

          rounded-full

          bg-indigo-500/10

          blur-[70px]

          pointer-events-none
        "
      />

      <div
        className="
          absolute

          bottom-[-120px]
          right-[-120px]

          w-[320px]
          h-[320px]

          md:w-[520px]
          md:h-[520px]

          rounded-full

          bg-red-500/5

          blur-[90px]

          pointer-events-none
        "
      />

      <div
        className="
          absolute
          inset-0

          opacity-[0.018]

          bg-[linear-gradient(rgba(0,0,0,0.35)_1px,transparent_1px),
              linear-gradient(90deg,rgba(0,0,0,0.35)_1px,transparent_1px)]

          bg-[size:42px_42px]

          md:bg-[size:72px_72px]

          pointer-events-none
        "
      />

      {/* ================================================= */}
      {/* LOGIN */}
      {/* ================================================= */}

      <div
        className="
          absolute

          top-4
          right-4

          md:top-8
          md:right-8

          z-20
        "
      >
        <motion.button
          whileHover={{
            y: -2,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={() => router.push("/select-mode")}
          className="
            group

            flex
            items-center

            gap-2

            h-11

            px-5

            rounded-full

            border
            border-[color:var(--border-soft)]

            bg-white/80

            backdrop-blur-xl

            text-[13px]
            font-medium

            text-[color:var(--foreground)]

            shadow-[0_10px_30px_rgba(0,0,0,0.06)]

            hover:border-[color:var(--border-strong)]

            transition-all
            duration-300
          "
        >
          <LogIn
            size={16}
            className="
              transition-transform
              duration-300

              group-hover:translate-x-[1px]
            "
          />

          <span>Login</span>
        </motion.button>
      </div>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div
        className="
          relative
          z-10

          flex
          items-center
          justify-center

          min-h-dvh

          px-5
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="
            relative

            w-full
            max-w-[820px]

            overflow-hidden

            rounded-[32px]

            border
            border-[color:var(--border-soft)]

            bg-[color:var(--surface-100)]

            shadow-[0_25px_90px_rgba(0,0,0,0.10)]

            px-6
            py-10

            sm:px-10
            sm:py-14

            md:px-16
            md:py-16
          "
        >
          {/* CAMADA VISUAL */}

          <div className="absolute inset-0 pointer-events-none">
            <div
              className="
                absolute
                inset-0

                bg-gradient-to-br

                from-transparent
                via-black/[0.015]
                to-black/[0.03]
              "
            />

            <div
              className="
                absolute

                inset-x-0
                top-0

                h-[1px]

                bg-gradient-to-r

                from-transparent
                via-black/10
                to-transparent
              "
            />
          </div>

          {/* CONTEÚDO */}

          <div
            className="
              relative
              z-10

              flex
              flex-col

              items-center

              text-center
            "
          >
            {/* BADGE */}

            <div
              className="
                inline-flex

                items-center

                rounded-full

                border
                border-[color:var(--border-soft)]

                bg-[color:var(--surface-200)]

                px-4
                py-2

                text-[10px]

                font-medium

                uppercase

                tracking-[0.28em]

                text-[color:var(--muted)]
              "
            >
              Ambiente Corporativo
            </div>

            {/* LOGO */}

            <div
              className="
    mt-8

    flex
    justify-center
  "
            >
              <div
                className="
      relative

      w-[180px]
      h-[80px]

      sm:w-[240px]
      sm:h-[100px]

      md:w-[320px]
      md:h-[130px]
    "
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_UPLOADS_URL}/empresa/logo-hmn.png`}
                  alt="HMN Frutas"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* TÍTULO */}

            <h1
              className="
                mt-8

                text-[24px]

                sm:text-[30px]

                md:text-[40px]

                font-black

                tracking-[-0.05em]

                text-[color:var(--foreground)]
              "
            >
              HMN FRUTAS
            </h1>

            {/* SUBTÍTULO */}

            <p
              className="
                mt-6

                text-[11px]

                sm:text-[12px]

                uppercase

                tracking-[0.35em]

                text-[color:var(--muted-soft)]
              "
            >
              Plataforma Operacional Privada
            </p>

            {/* AVISO */}

            <div
              className="
                mt-8

                rounded-full

                border

                border-amber-200

                bg-amber-50

                px-5
                py-3

                text-[11px]

                font-semibold

                uppercase

                tracking-[0.14em]

                text-amber-700
              "
            >
              Somente Uso Interno Autorizado
            </div>

            {/* DESCRIÇÃO */}

            <p
              className="
                mt-10

                max-w-[640px]

                text-[14px]

                sm:text-[15px]

                leading-relaxed

                text-[color:var(--muted)]
              "
            >
              Plataforma corporativa para gestão operacional HMN Frutas.
            </p>

            {/* FOOTER */}

            <div
              className="
                mt-10

                text-[12px]

                text-[color:var(--muted-soft)]
              "
            >
              Compras • Vendas • Estoque • Financeiro
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
