import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { type Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    images: [
      "https://yazameet.s3.eu-central-1.amazonaws.com/admin/og-image.png",
    ],
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
