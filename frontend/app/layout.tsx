import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import TransitionProvider from "../components/TransitionProvider";

export const metadata: Metadata = {
  title: "CampusGPT — Knowledge Without Limits",

  description:
    "Your intelligent academic companion. Explore, learn and achieve more with CampusGPT.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TransitionProvider>
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}