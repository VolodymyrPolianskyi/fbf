import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "framebyframe — a diary for everything you watch",
  description:
    "framebyframe is a film diary in the making: log what you watch, rate it, and keep a record of your year in cinema. Sign up now to claim a founding member account.",
  openGraph: {
    title: "framebyframe — a diary for everything you watch",
    description:
      "A film diary in the making. Sign up early and claim a founding member account.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
