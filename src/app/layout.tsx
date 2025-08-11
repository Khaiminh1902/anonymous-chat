import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

export const metadata: Metadata = {
  title: "Anonymous Chat Terminal",
  description: "Vibe code all functions but style is mine hehe",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-green-400 font-mono overflow-hidden">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
