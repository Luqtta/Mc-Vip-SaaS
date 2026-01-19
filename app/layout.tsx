import "./globals.css";

export const metadata = {
  title: "MC VIP Store",
  description: "Compre VIP e receba automaticamente no servidor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
