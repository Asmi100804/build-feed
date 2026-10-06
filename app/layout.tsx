import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/common/header";
import Footer from "@/components/ui/common/footer";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "BuildFeed - Share Your Creations, Discover New Launches",
  description:
    "A community platform for creators to showcase their apps, AI tools, SaaS products, and creative projects. Authentic launches, real builders, genuine feedback.",
  icons: {
    icon: "/sparkle.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.className} antialiased`}>
    <body className="min-h-full flex flex-col">
      <Suspense>
        <ClerkProvider>
          <Header />
          {children}
          <Footer />
        </ClerkProvider>
      </Suspense>
    </body>
  </html>
  );
}
