"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getAlertas,
  marcarAlertaComoLido,
  resolverAlerta,
} from "../services/alertas.service";

import { AlertaSistema } from "../types/alerta.types";

export function useAlertas() {
  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  const [alertas, setAlertas] = useState<
    AlertaSistema[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  ////////////////////////////////////////////////////////////
  // REFS
  ////////////////////////////////////////////////////////////

  const mountedRef = useRef(true);

  const pollingRef =
    useRef<NodeJS.Timeout | null>(null);

  const previousIdsRef = useRef<string[]>(
    [],
  );

  const initializedRef = useRef(false);

  ////////////////////////////////////////////////////////////
  // LOAD ALERTAS
  ////////////////////////////////////////////////////////////

  const loadAlertas = useCallback(
    async (
      options?: {
        silent?: boolean;
      },
    ) => {
      try {
        //////////////////////////////////////////////////////
        // LOADING
        //////////////////////////////////////////////////////

        if (
          !options?.silent &&
          mountedRef.current
        ) {
          setLoading(true);
        }

        //////////////////////////////////////////////////////
        // REQUEST
        //////////////////////////////////////////////////////

        const response =
          await getAlertas();

        //////////////////////////////////////////////////////
        // IDS
        //////////////////////////////////////////////////////

        const currentIds = response.map(
          (alerta) => alerta.id,
        );

        //////////////////////////////////////////////////////
        // DETECTA NOVOS ALERTAS
        //////////////////////////////////////////////////////

        if (initializedRef.current) {
          const hasNewAlert =
            currentIds.some(
              (id) =>
                !previousIdsRef.current.includes(
                  id,
                ),
            );

          if (hasNewAlert) {
            window.dispatchEvent(
              new CustomEvent(
                "new-alert",
              ),
            );
          }
        }

        //////////////////////////////////////////////////////
        // SALVA IDS
        //////////////////////////////////////////////////////

        previousIdsRef.current =
          currentIds;

        initializedRef.current = true;

        //////////////////////////////////////////////////////
        // UPDATE STATE
        //////////////////////////////////////////////////////

        if (mountedRef.current) {
          setAlertas(response);
        }
      } catch (error) {
        //////////////////////////////////////////////////////
        // LOG
        //////////////////////////////////////////////////////

        console.error(
          "[ALERTAS_LOAD_ERROR]",
          error,
        );
      } finally {
        //////////////////////////////////////////////////////
        // LOADING FALSE
        //////////////////////////////////////////////////////

        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  ////////////////////////////////////////////////////////////
  // MARCAR COMO LIDO
  ////////////////////////////////////////////////////////////

  const marcarComoLido = useCallback(
    async (id: string) => {
      ////////////////////////////////////////////////////////
      // OPTIMISTIC UPDATE
      ////////////////////////////////////////////////////////

      setAlertas((old) =>
        old.map((alerta) =>
          alerta.id === id
            ? {
                ...alerta,
                lido: true,
              }
            : alerta,
        ),
      );

      try {
        await marcarAlertaComoLido(id);
      } catch (error) {
        //////////////////////////////////////////////////////
        // ROLLBACK
        //////////////////////////////////////////////////////

        setAlertas((old) =>
          old.map((alerta) =>
            alerta.id === id
              ? {
                  ...alerta,
                  lido: false,
                }
              : alerta,
          ),
        );

        console.error(
          "[ALERTA_LIDO_ERROR]",
          error,
        );
      }
    },
    [],
  );

  ////////////////////////////////////////////////////////////
  // RESOLVER ALERTA
  ////////////////////////////////////////////////////////////

  const resolver = useCallback(
    async (id: string) => {
      ////////////////////////////////////////////////////////
      // OPTIMISTIC UPDATE
      ////////////////////////////////////////////////////////

      setAlertas((old) =>
        old.map((alerta) =>
          alerta.id === id
            ? {
                ...alerta,
                resolvido: true,
                lido: true,
              }
            : alerta,
        ),
      );

      try {
        await resolverAlerta(id);
      } catch (error) {
        //////////////////////////////////////////////////////
        // ROLLBACK
        //////////////////////////////////////////////////////

        setAlertas((old) =>
          old.map((alerta) =>
            alerta.id === id
              ? {
                  ...alerta,
                  resolvido: false,
                  lido: false,
                }
              : alerta,
          ),
        );

        console.error(
          "[ALERTA_RESOLVE_ERROR]",
          error,
        );
      }
    },
    [],
  );

  ////////////////////////////////////////////////////////////
  // START POLLING
  ////////////////////////////////////////////////////////////

  const startPolling = useCallback(() => {
    //////////////////////////////////////////////////////////
    // CLEAR ANTIGO
    //////////////////////////////////////////////////////////

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    //////////////////////////////////////////////////////////
    // NOVO POLLING
    //////////////////////////////////////////////////////////

    pollingRef.current = setInterval(
      () => {
        //////////////////////////////////////////////////////
        // NÃO FAZ REQUEST EM ABA OCULTA
        //////////////////////////////////////////////////////

        if (
          document.visibilityState ===
          "hidden"
        ) {
          return;
        }

        loadAlertas({
          silent: true,
        });
      },
      10000,
    );
  }, [loadAlertas]);

  ////////////////////////////////////////////////////////////
  // EFFECT
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    mountedRef.current = true;

    //////////////////////////////////////////////////////////
    // LOAD INICIAL
    //////////////////////////////////////////////////////////

    loadAlertas();

    //////////////////////////////////////////////////////////
    // START POLLING
    //////////////////////////////////////////////////////////

    startPolling();

    //////////////////////////////////////////////////////////
    // VISIBILITY CHANGE
    //////////////////////////////////////////////////////////

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        loadAlertas({
          silent: true,
        });
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    //////////////////////////////////////////////////////////
    // CLEANUP
    //////////////////////////////////////////////////////////

    return () => {
      mountedRef.current = false;

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      if (pollingRef.current) {
        clearInterval(
          pollingRef.current,
        );
      }
    };
  }, [
    loadAlertas,
    startPolling,
  ]);

  ////////////////////////////////////////////////////////////
  // COUNTS
  ////////////////////////////////////////////////////////////

  const naoLidos = alertas.filter(
    (alerta) => !alerta.lido,
  ).length;

  const ativos = alertas.filter(
    (alerta) => !alerta.resolvido,
  );

  const criticos = ativos.filter(
    (alerta) =>
      alerta.severidade === "CRITICA",
  );

  ////////////////////////////////////////////////////////////
  // RETURN
  ////////////////////////////////////////////////////////////

  return {
    //////////////////////////////////////////////////////////
    // DATA
    //////////////////////////////////////////////////////////

    alertas,

    ativos,

    criticos,

    naoLidos,

    //////////////////////////////////////////////////////////
    // STATE
    //////////////////////////////////////////////////////////

    loading,

    //////////////////////////////////////////////////////////
    // ACTIONS
    //////////////////////////////////////////////////////////

    reload: loadAlertas,

    marcarComoLido,

    resolver,
  };
}