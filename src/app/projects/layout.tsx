import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Yazameet",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function ProjectsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="mx-10 pt-36">{children}</div>;
}
