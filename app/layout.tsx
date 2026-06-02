import "./globals.css";
import { ReactQueryProvider } from "@/core/providers/react-query";
import { ClientProviders } from "@/core/providers/client-providers";

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
          <ReactQueryProvider>
            <ClientProviders>{children}</ClientProviders>
          </ReactQueryProvider>
      </body>
    </html>
  );
}