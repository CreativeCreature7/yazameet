import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Up-Rise | Yazameet",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function UpriseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="mx-4 pt-2 sm:pt-4 md:pt-6 lg:mx-10">{children}</div>;
}
