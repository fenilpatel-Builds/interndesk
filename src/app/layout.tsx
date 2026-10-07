import type { Metadata } from "next";
import "./globals.css";
import { AuthListener } from "@/components/auth/auth-listener";

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
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
