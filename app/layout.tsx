import { MaintenanceBanner } from "@/components/maintenance-banner";
import DevPlanSwitcher from "@/components/dev/DevPlanSwitcher";
import { TestPlanProvider } from "@/components/dev/TestPlanProvider";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Each tool sets only its own title; this frames it.
  title: {
    default: "PDFAI — Every PDF tool you need, in one place",
    template: "%s | PDFAI",
  },
  description: "Every PDF tool you need, in one place.",
  openGraph: {
    siteName: "PDFAI",
    type: "website",
    url: siteUrl,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <MaintenanceBanner />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Wraps everything, so the language chosen in Settings applies to
              the marketing pages and the tools as well as the signed-in area. */}
          <LocaleProvider>
            <TestPlanProvider>
              {children}
              <DevPlanSwitcher />
            </TestPlanProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}