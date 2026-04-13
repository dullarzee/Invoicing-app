import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { Toaster } from "sonner";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import NavBar from "@/components/ui/navBar";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "G-R Tech Services - InvoiceHub",
  description:
    "A modern invoicing app built with Next.js, Prisma, and Tailwind CSS for G-R Tech Services. ",
  generator: "Dullarzee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <NavBar />
        <Sidebar />
        <div className="lg:ml-64 mt-16 lg:mt-0">{children}</div>
        <Analytics />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
