import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import RouteGuard from "@/components/RouteGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ticket System",
  description: "Modern Support Ticket Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            <RouteGuard>
              <Navbar />
              <main className="min-h-screen bg-slate-50">
                {children}
              </main>
            </RouteGuard>
            <Toaster />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
