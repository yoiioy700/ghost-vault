import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppWrapper } from "./AppWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ghost Vault | Decentralized Inheritance",
  description: "Secure, non-custodial Bitcoin inheritance protocol",
  other: {
    "talentapp:project_verification": "7425272f7cdd1d86789c1edd1a20a12c0f95a2f9df7d91085e88ccfbc182022eba6cd8c3b75df1a2b1d58e9b0d3e5884a1b6da0d2c65806870cd59af519cdfcb",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
