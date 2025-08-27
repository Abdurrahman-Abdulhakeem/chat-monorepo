import Providers from "@/contexts/AllProviders";
import "./globals.css";
import { ReactNode } from "react";

export const metadata = { title: "MERN Speed Chat" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
