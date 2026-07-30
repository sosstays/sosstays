import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-ZG60S049VC";

// Brand fonts per the Sos Stays brand knowledge base:
// Playfair Display for headlines/pull quotes, Inter for body/UI.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sos Stays | Holiday Homes to Book & Properties to Manage in Louth, Meath & the Mournes",
  description:
    "Book direct holiday homes across the Boyne Valley, Louth, and the Mournes — no Airbnb fees. Own a property? We manage it for you and grow your income. Send your SOS.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await client.fetch(SITE_SETTINGS_QUERY);

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF8] font-sans text-[#1C1C1C]">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <div className="flex-1">{children}</div>
        <Footer socialLinks={settings?.socialLinks} />
      </body>
    </html>
  );
}
