import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuronPay - Pay-per-Token AI Micro-Billing Protocol",
  description: "Dynamic micro-payments on Stellar Testnet for pay-as-you-go AI LLM prompt tokens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0B0F19]">
        {children}
      </body>
    </html>
  );
}
