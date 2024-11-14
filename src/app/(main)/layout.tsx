import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp-button";

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
