"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Users, FolderKanban, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const t = useTranslations();
  const { data: stats } = api.admin.getStats.useQuery();

  const cards = [
    {
      title: "Total Users",
      value: stats?.usersCount ?? 0,
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Total Projects",
      value: stats?.projectsCount ?? 0,
      icon: FolderKanban,
      href: "/admin/projects",
    },
    {
      title: "Blog Posts",
      value: stats?.postsCount ?? 0,
      icon: FileText,
      href: "/admin/posts",
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequestsCount ?? 0,
      icon: AlertCircle,
      href: "/admin/requests",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="transition-all hover:scale-105 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
