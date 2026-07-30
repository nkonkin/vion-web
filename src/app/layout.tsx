import type { Metadata, Viewport } from "next";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Vion Konger",
  description: "Official website of Vion Konger — DJ and producer.",
  openGraph: {
    title: "Vion Konger",
    description: "Official website of Vion Konger — DJ and producer.",
    images: ["/press.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-foreground antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
