import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuillForge — Engineering & Technology Publication",
  description: "A production-grade publication and blog system showcasing modern architecture, MERN engineering, and real-time Socket.io synchronization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0b0f19] text-[#f9fafb] antialiased">
        {children}
      </body>
    </html>
  );
}
