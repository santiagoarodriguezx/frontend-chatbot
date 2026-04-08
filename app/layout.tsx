import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AURA - Dashboard",
  description:
    "Configura tu whatsapp business con AURA y automatiza tu atención al cliente, ventas y reservas en un solo lugar.",
  icons: {
    icon: "./public/logo-aura.JPG",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
