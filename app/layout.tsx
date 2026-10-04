import type {Viewport } from "next";

import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";




export const viewport: Viewport = {
  themeColor: "#1c5647",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="flex min-h-full flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
