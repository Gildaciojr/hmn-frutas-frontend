"use client";

import { useEffect } from "react";
import { setupInterceptor } from "@/core/http/interceptor";

import { useAuthStore } from "@/core/stores/useAuthStore";
import { useAppStore } from "@/core/stores/useAppStore";

export function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 🔐 AUTH STORE
    const authStore = useAuthStore.getState();

    // 📦 APP STORE (MODE)
    const appStore = useAppStore.getState();

    // 🔥 HIDRATAÇÃO COMPLETA (ORDEM IMPORTA)
    authStore.hydrate();
    appStore.hydrate();

    // 🔐 INTERCEPTOR DEPOIS DA HIDRATAÇÃO
    setupInterceptor(() => useAuthStore.getState().token);
  }, []);

  return <>{children}</>;
}