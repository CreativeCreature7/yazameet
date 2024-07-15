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
import { useTranslations } from "next-intl";
import { Icons } from "@/components/Icons";

export default function Login() {
  const t = useTranslations();

  return (
    <Card className="fixed left-1/2 top-1/2 mx-auto max-w-sm -translate-x-1/2 -translate-y-1/2">
      <CardHeader>
        <CardTitle className="text-2xl">{t("login")}</CardTitle>
        <CardDescription>{t("enter_your_email_below")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">{t("password")}</Label>
              <Link
                href="/auth/forgot-password"
                className="ms-auto inline-block text-sm underline"
              >
                {t("forgot_your_password")}
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            {t("login")}
          </Button>
          <div className="flex flex-row gap-3">
            <Button
              variant="outline"
              className="inline-flex w-full items-center justify-center"
            >
              <Icons.google className="h-5" />
            </Button>
            <Button
              variant="outline"
              className="inline-flex w-full items-center justify-center"
            >
              <Icons.discord className="h-5" />
            </Button>
          </div>
        </div>
        <div className="mt-4 text-center text-sm">
          {t("dont_have_an_account")}{" "}
          <Link href="/auth/sign-up" className="underline">
            {t("sign_up")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
