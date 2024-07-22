"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { getProviders, signIn, useSession } from "next-auth/react";
import { Icons } from "@/components/Icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const BaseSchema = (t: (arg: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, {
        message: t("field_required"),
      })
      .email(t("enter_valid_email")),
  });

export function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const session = useSession();
  const providers = getProviders();
  const formSchema = BaseSchema(t);
  const [emailSent, setEmailSent] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    signIn("email", {
      email: values.email,
      redirect: false,
    });
    toast.success(`${t("email_sent_to")}: ${values.email}`);
    setEmailSent(true);
  }

  useEffect(() => {
    if (session.data?.user) {
      router.replace("/projects");
    }
  }, [session, router]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input placeholder="m@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit" disabled={emailSent}>
            {t("login")}
          </Button>
        </form>
      </Form>
      <div className="mt-4 flex flex-row gap-3">
        {providers &&
          Object.values(providers)
            .filter((provider) => provider.id !== "email")
            .map((provider) => (
              <Button
                key={provider.name}
                variant="outline"
                className="inline-flex w-full items-center justify-center"
                onClick={() => signIn(provider.id)}
              >
                {provider.name === "Discord" ? (
                  <Icons.discord className="h-5" />
                ) : (
                  <Icons.google className="h-5" />
                )}
              </Button>
            ))}
      </div>
    </>
  );
}
