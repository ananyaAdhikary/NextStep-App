import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextStep — Find your global next step",
  description:
    "Scholarships, career markets, and skill roadmaps matched to where you're headed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col bg-paper text-ink"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
