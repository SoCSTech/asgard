import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { CookiesProvider } from "next-client-cookies/server";

export const metadata: Metadata = {
  title: "Asgard",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${GeistSans.variable} min-h-screen min-w-full`}
    >
      <body suppressHydrationWarning className="min-h-screen min-w-full">
        <CookiesProvider>{children}</CookiesProvider>
      </body>
    </html>
  );
}
