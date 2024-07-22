import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/Icons";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/app/_components/login-form";

export default async function Login() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/projects");
  }
  const providers = await getProviders();

  const t = await getTranslations();

  return (
    <Card className="fixed left-1/2 top-1/2 mx-auto max-w-sm -translate-x-1/2 -translate-y-1/2">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t("login")}</CardTitle>
        <CardDescription>{t("enter_your_email_below")}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm providers={providers} />
      </CardContent>
    </Card>
  );
}
