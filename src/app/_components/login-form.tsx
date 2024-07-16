"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ClientSafeProvider, LiteralUnion, signIn } from "next-auth/react";
import { BuiltInProviderType } from "next-auth/providers/index";
import { Icons } from "@/components/Icons";

const BaseSchema = (t: (arg: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, {
        message: t("field_required"),
      })
      .email(t("enter_valid_email")),
    password: z.string().min(1, {
      message: t("field_required"),
    }),
  });

type Props = {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
};

export function LoginForm({ providers }: Props) {
  const t = useTranslations();
  const formSchema = BaseSchema(t);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <FormLabel>{t("password")}</FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="ms-auto inline-block text-sm underline"
                    >
                      {t("forgot_your_password")}
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="m@example.com"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">
            {t("login")}
          </Button>
        </form>
      </Form>
      <div className="mt-4 flex flex-row gap-3">
        {Object.values(providers!).map((provider) => (
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
      <div className="mt-4 text-center text-sm">
        {t("dont_have_an_account")}{" "}
        <Link href="/auth/sign-up" className="underline">
          {t("sign_up")}
        </Link>
      </div>
    </>
  );
}
