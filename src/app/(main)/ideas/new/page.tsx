"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import Ideation2 from "@/../public/Images/ideation_2.svg";

export default function NewIdeationSession() {
  const router = useRouter();
  const t = useTranslations("ideas.new_session");
  const [apiError, setApiError] = useState<string | null>(null);

  // Create form schema with Zod
  const formSchema = z.object({
    name: z.string().min(1, t("session_name_required")),
    isTeam: z.boolean().default(false),
  });

  // Create form with React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      isTeam: false,
    },
  });

  // Always call the mutation hook, but we'll only use it if the API is ready
  const createMutation = api.ideation?.create?.useMutation({
    onSuccess: (data) => {
      toast.success(t("session_created"));
      router.push(`/ideas/session/${data.id}`);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error(error.message || "Failed to create session");
    },
  });

  // Check if API is ready
  const isApiReady = !!api.ideation?.create;

  // Handle form submission
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isApiReady && createMutation?.mutate) {
        createMutation.mutate(values);
      } else {
        const errorMsg =
          "The ideation feature is not available right now. Please try refreshing the page.";
        console.error(errorMsg, { api, ideation: api.ideation });
        setApiError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error in submit handler:", error);
      setApiError(String(error));
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <div className="container flex max-w-lg flex-1 flex-col items-center justify-center py-8">
      {apiError && (
        <Card className="mb-4 border-red-300 bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300">
          <h3 className="mb-2 text-sm font-medium">Error</h3>
          <p className="text-sm">{apiError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </Card>
      )}

      <Card className="p-6">
        <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("session_name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("session_name_placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isTeam"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                    />
                  </FormControl>
                  <FormLabel className="!m-0">
                    {t("team_session")} {t("coming_soon")}
                  </FormLabel>
                </FormItem>
              )}
            />

            {form.watch("isTeam") && (
              <div className="space-y-2">
                <Label htmlFor="teamMembers">{t("team_members")}</Label>
                <Input
                  id="teamMembers"
                  placeholder={t("team_members_placeholder")}
                  disabled // Feature will be implemented later
                />
                <p className="text-xs text-muted-foreground">
                  {t("team_members_help")}
                </p>
              </div>
            )}

            <div className="pt-2">
              <LoadingButton
                type="submit"
                className="w-full"
                loading={createMutation?.isPending}
                disabled={!isApiReady}
              >
                {isApiReady ? t("start_session") : "Loading..."}
              </LoadingButton>
            </div>
          </form>
        </Form>
        <div className="mt-6">
          <Image src={Ideation2} alt="Ideation Logo" height={300} />
        </div>
      </Card>
    </div>
  );
}
