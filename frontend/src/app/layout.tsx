import "@/styles/globals.css";
import { ReactNode } from "react";
import Header from "@/components/custom/home-components/header";
import Footer from "@/components/custom/home-components/footer";
import { Metadata } from "next";
import { Sofia_Sans } from "next/font/google";
import MainContent from "./MainContent";
import { Toaster } from "@/components/ui/sonner";


const sofia = Sofia_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rato: Découvrir les entreprises ou partagez votre propre expérience",
  description: "Découvrir les entreprises ou partagez votre propre expérience",
  icons: {
    icon: "/favicon/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${sofia.className} bg-[#f8f7f5] h-full`}
        suppressHydrationWarning
      >
        <Header />
        <MainContent>{children}</MainContent>

        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
