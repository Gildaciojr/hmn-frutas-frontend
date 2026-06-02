"use client";

import { useEffect } from "react";
import { setupInterceptor } from "@/core/http/interceptor";

export function AppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setupInterceptor(() => {
      if (typeof window === "undefined") return null;

      return localStorage.getItem("token");
    });
  }, []);

  return <>{children}</>;
}