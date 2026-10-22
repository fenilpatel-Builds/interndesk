import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthListener } from "@/components/auth/auth-listener";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InternDesk — Your Internship Journey, Simplified.",
  description:
    "Register, learn, work, track your progress, complete assessments, and get your internship documents — all in one place.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`h-full antialiased scroll-smooth ${sansFont.variable} ${serifFont.variable}`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
