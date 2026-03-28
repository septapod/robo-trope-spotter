import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Robo Trope Spotter",
  description:
    "Paste text. See the AI writing tropes. Get a report card. Send it to someone who needs it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-0 text-zinc-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
