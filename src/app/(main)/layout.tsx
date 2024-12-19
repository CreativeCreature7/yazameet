import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { type Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    images: ["/images/og-image.png"],
  },
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <WhatsAppButton phoneNumber="+972547662015" />
    </>
  );
}
