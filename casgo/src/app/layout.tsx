import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/contexts/ToastContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Using system fonts instead of Google Fonts to avoid SSL issues
const inter = {
  className: "font-sans",
};

export const metadata: Metadata = {
  title: "EcoMind - Sustainability Application",
  description:
    "EcoMind: AI-powered platform to help businesses reduce costs and carbon footprints",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" enableSystem>
          <AuthProvider>
            <ToastProvider position="top-right" maxToasts={5}>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
