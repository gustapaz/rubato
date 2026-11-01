import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title:
    "RUBATO · Sequenciador euclidiano polirrítmico, partitura e exportação MIDI real",
  description:
    "Sequenciador euclidiano polirrítmico, partitura e exportação MIDI real",
  metadataBase: new URL("https://rubato-gustapaz.starrylinen.chatgpt.site"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "RUBATO",
    description:
      "Sequenciador euclidiano polirrítmico, partitura e exportação MIDI real",
    type: "website",
    locale: "pt_BR",
  },
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
