import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Yazameet",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function ProjectsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-4 pt-12 sm:pt-24 md:pt-36 lg:mx-10">{children}</div>
  );
}
