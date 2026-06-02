"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  BellRing,
  CircleAlert,
} from "lucide-react";

export function AlertRealtimeToast() {
  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  const [visible, setVisible] =
    useState(false);

  ////////////////////////////////////////////////////////////
  // TIMEOUT REF
  ////////////////////////////////////////////////////////////

  const timeoutRef =
    useRef<NodeJS.Timeout | null>(
      null,
    );

  ////////////////////////////////////////////////////////////
  // EFFECT
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    function handleNewAlert() {
      ////////////////////////////////////////////////////////
      // RESET TIMER
      ////////////////////////////////////////////////////////

      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current,
        );
      }

      ////////////////////////////////////////////////////////
      // SHOW
      ////////////////////////////////////////////////////////

      setVisible(true);

      ////////////////////////////////////////////////////////
      // AUTO HIDE
      ////////////////////////////////////////////////////////

      timeoutRef.current =
        setTimeout(() => {
          setVisible(false);
        }, 4500);
    }

    //////////////////////////////////////////////////////////
    // EVENT
    //////////////////////////////////////////////////////////

    window.addEventListener(
      "new-alert",
      handleNewAlert,
    );

    //////////////////////////////////////////////////////////
    // CLEANUP
    //////////////////////////////////////////////////////////

    return () => {
      window.removeEventListener(
        "new-alert",
        handleNewAlert,
      );

      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current,
        );
      }
    };
  }, []);

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{
            opacity: 0,
            y: 18,
            scale: 0.96,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 18,
            scale: 0.96,
          }}
          transition={{
            duration: 0.22,
          }}
          className="
            fixed

            bottom-6
            right-6

            z-[999999]

            w-[360px]

            overflow-hidden

            rounded-[28px]

            border
            border-white/10

            bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))]

            shadow-[0_30px_90px_rgba(15,23,42,0.18)]

            backdrop-blur-2xl
          "
        >
          {/* ================================================= */}
          {/* FX */}
          {/* ================================================= */}

          <div
            className="
              absolute
              top-0
              right-0

              w-[160px]
              h-[160px]

              rounded-full

              bg-red-500/10

              blur-[48px]
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
              via-red-500/30
              to-transparent
            "
          />

          {/* ================================================= */}
          {/* CONTENT */}
          {/* ================================================= */}

          <div
            className="
              relative
              z-10

              flex
              items-start
              gap-4

              p-4
            "
          >
            {/* ICON */}
            <div
              className="
                relative

                flex
                items-center
                justify-center

                w-12
                h-12

                rounded-[18px]

                bg-red-50

                text-red-600

                shrink-0
              "
            >
              {/* PULSE */}
              <div
                className="
                  absolute
                  inset-0

                  rounded-[18px]

                  bg-red-400/20

                  animate-ping
                "
              />

              <BellRing
                size={20}
                className="relative z-10"
              />
            </div>

            {/* CONTENT */}
            <div className="min-w-0 flex-1">
              {/* TAG */}
              <div className="flex items-center gap-2">
                <CircleAlert
                  size={14}
                  className="
                    text-red-500
                    shrink-0
                  "
                />

                <span
                  className="
                    text-[10px]

                    uppercase

                    tracking-[0.18em]

                    text-red-500

                    font-semibold
                  "
                >
                  alerta operacional
                </span>
              </div>

              {/* TITLE */}
              <h4
                className="
                  mt-2

                  text-[15px]

                  font-semibold

                  tracking-[-0.03em]

                  text-[color:var(--foreground)]
                "
              >
                Novo alerta detectado
              </h4>

              {/* MESSAGE */}
              <p
                className="
                  mt-1

                  text-[12px]

                  leading-relaxed

                  text-[color:var(--muted)]
                "
              >
                O sistema identificou uma
                nova ocorrência financeira
                que exige atenção.
              </p>
            </div>
          </div>

          {/* ================================================= */}
          {/* PROGRESS */}
          {/* ================================================= */}

          <motion.div
            initial={{
              width: "100%",
            }}
            animate={{
              width: 0,
            }}
            transition={{
              duration: 4.5,
              ease: "linear",
            }}
            className="
              h-[2px]

              bg-[linear-gradient(90deg,#ef4444,#dc2626)]
            "
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}