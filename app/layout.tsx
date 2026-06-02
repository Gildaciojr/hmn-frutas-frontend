import "./globals.css";
import { ReactQueryProvider } from "@/core/providers/react-query";
import { ClientProviders } from "@/core/providers/client-providers";
import { AppProvider } from "./providers";

export const metadata = {
  title: "Melancias System",
  description: "Controle de compras e vendas de melancias",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className="noise-overlay antialiased">
        <AppProvider>
          <ReactQueryProvider>
            <ClientProviders>{children}</ClientProviders>
          </ReactQueryProvider>
        </AppProvider>
      </body>
    </html>
  );
}