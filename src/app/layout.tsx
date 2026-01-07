import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative First",
  description: "Australia-first creator marketplace with a human touch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="page-shell">
        {children}
      </body>
    </html>
  );
}
