import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { env } from "@/env";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (session?.user?.email !== env.ADMIN_EMAIL) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
