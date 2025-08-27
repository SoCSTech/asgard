import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import QueryProvider from "./query-provider";

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
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
