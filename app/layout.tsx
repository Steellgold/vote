import { ThemeProvider } from "@/components/theme-provider";
import { PropsWithChildren } from "react";
import { Component } from "@/lib/types";
import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/theme-switcher";
import Link from "next/link";
import { Github } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900", });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900", });

export const metadata: Metadata = {
  title: "Polls",
  applicationName: "Make a poll",
  description: "Create and share polls with your friends and family",
  keywords: ["poll", "vote", "polls", "vote", "polls", "vote"],
  openGraph: {
    title: "Polls",
    description: "Create and share polls with your friends and family",
    type: "website",
    url: "https://polls.gaetanhus.fr/",
    siteName: "Polls",
    images: [
      {
        url: "https://polls.gaetanhus.fr/og.png",
        width: 1200,
        height: 630,
        alt: "Polls Open Graph Image",
      },
    ],
  },
  twitter: {
    images: [
      {
        url: "https://polls.gaetanhus.fr/og.png",
        width: 1200,
        height: 630,
        alt: "Polls Open Graph Image",
      },
    ],
    title: "Polls",
    description: "Create and share polls with your friends and family",
  }
};

export const viewport: Viewport = {
  themeColor: "#212121"
};

const Layout: Component<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        geistSans.variable, geistMono.variable,
        "antialiased",
        "mt-10"
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />

          <main className="px-4 py-8">
            {children}
          </main>

          <div className="absolute top-0 right-0 p-4 text-sm space-x-1">
            <Link href="https://github.com/Steellgold/vote" className={buttonVariants({ variant: "outline", size: "icon" })}>
              <Github size={24} />
            </Link>
            <ModeToggle />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}


export default Layout;