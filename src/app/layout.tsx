import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingCart from "@/components/layout/FloatingCart";
import NavigationProgress from "@/components/layout/NavigationProgress";
import { SITE } from "@/lib/site";

// Fonts are bundled (variable, latin subset) so builds never depend on Google Fonts.
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const jakarta = localFont({
  src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "rheumatology wholesale",
    "biologics supplier",
    "medical wholesale",
    "dermal fillers",
    "botulinum toxins",
    "orthopedic injections",
    "peptides",
    "aesthetic supply",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ground text-ink">
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <FloatingCart />
            <NavigationProgress />
            <Toaster position="top-right" richColors />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
