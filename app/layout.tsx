import "./globals.css";
import type { Metadata } from "next";
import { ReactQueryProvider } from "@/core/providers/react-query";
import { ClientProviders } from "@/core/providers/client-providers";

export const metadata: Metadata = {
  title: "HMN Frutas",
  applicationName: "HMN Frutas",
  description: "Sistema de gestão de compras e vendas da HMN Frutas",
  appleWebApp: {
    capable: true,
    title: "HMN Frutas",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className="noise-overlay antialiased">
          <ReactQueryProvider>
            <ClientProviders>{children}</ClientProviders>
          </ReactQueryProvider>
      </body>
    </html>
  );
}
