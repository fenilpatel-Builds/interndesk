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
  title: "Akash Technolabs — Institute Activity Management System",
  description:
    "Empowering students, faculty and administrators with a smart, secure and seamless platform for activities, submissions, learning and progress at Akash Technolabs.",
  icons: {
    icon: "/images/akash-at-watermark-hd.png",
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
