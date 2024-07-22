import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/app/_components/login-form";

export default async function Login() {
  const t = await getTranslations();

  return (
    <Card className="fixed left-1/2 top-1/2 mx-auto max-w-sm -translate-x-1/2 -translate-y-1/2">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t("login")}</CardTitle>
        <CardDescription>{t("enter_your_email_below")}</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
