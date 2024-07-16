"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import MultiSelect, { Option } from "@/components/ui/multi-select";
import { Roles } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { optionRolesSchema } from "@/lib/schemas";

const BaseSchema = (t: (arg: string) => string) =>
  z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    rolesNeeded: z.array(optionRolesSchema),
  });

export function LatestProject() {
  const t = useTranslations();
  const [LatestProject] = api.project.getLatest.useSuspenseQuery();
  const formSchema = BaseSchema(t);
  const defaultValues = {
    name: "",
    description: "",
    rolesNeeded: [],
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const OPTIONS: Option[] = Object.values(Roles).map((value) => ({
    label: t(value),
    value,
  }));

  const utils = api.useUtils();
  const createProject = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      form.reset();
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedValues = {
      ...values,
      rolesNeeded: values.rolesNeeded.map((role) => role.value),
    };
    createProject.mutate(updatedValues);
  }

  return (
    <div className="w-full max-w-xs">
      {LatestProject ? (
        <p className="truncate">
          Your most recent project: {LatestProject.name}
        </p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative grid w-full gap-2"
        >
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("project_name")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <AutosizeTextarea
                      placeholder={t("project_description")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="rolesNeeded"
            render={({ field }) => (
              <FormItem className="block w-full">
                <FormLabel>{t("what_are_your_roles")}</FormLabel>
                <FormControl>
                  <MultiSelect
                    {...field}
                    defaultOptions={OPTIONS}
                    placeholder={t("select_your_roles")}
                    emptyIndicator={
                      <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        {t("no_results")}
                      </p>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            {t("join")}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
