import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GlobalThemeToggle } from "@/components/layout/GlobalThemeToggle";

const THEME_BOOTSTRAP_SCRIPT = `(function(){
  try {
    var key = "pup-lms-theme";
    var stored = window.localStorage.getItem(key);
    var theme = (stored === "dark" || stored === "light")
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}

  try {
    var cleanBis = function () {
      var nodes = document.querySelectorAll("[bis_skin_checked]");
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].removeAttribute("bis_skin_checked");
      }
    };

    cleanBis();

    var observer = new MutationObserver(function () {
      cleanBis();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ["bis_skin_checked"],
    });
  } catch (e) {}
})();`;

const sans = Source_Sans_3({
  variable: "--font-main",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-code",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PUP-B-ILMS — Ugnay",
  description: "PUP Bataan Integrated Learning Management System.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
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
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script
          id="theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
        <GlobalThemeToggle />
        {children}
      </body>
    </html>
  );
}
