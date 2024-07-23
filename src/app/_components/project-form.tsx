"use client";

import { api } from "@/trpc/react";
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
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useState } from "react";

const BaseSchema = (t: (arg: string) => string) =>
  z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    rolesNeeded: z.array(optionRolesSchema).min(1),
  });

export function ProjectForm() {
  const t = useTranslations();
  const session = useSession();
  const [openDialog, setOpenDialog] = useState(false);
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
  const { mutate: createProject, isPending } = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      form.reset();
      setOpenDialog(false);
      toast.success(t("project_added_successfully"));
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedValues = {
      ...values,
      rolesNeeded: values.rolesNeeded.map((role) => role.value),
    };
    createProject(updatedValues);
  }

  return (
    <Dialog open={openDialog} onOpenChange={() => setOpenDialog(!openDialog)}>
      <DialogTrigger asChild>
        <Button
          variant="expandIcon"
          iconPlacement="right"
          Icon={PlusIcon}
          disabled={!session?.data?.user}
        >
          {t("add_new_project")}
        </Button>
      </DialogTrigger>
      <DialogContent className="hidden-scrollbar overflow-y-scroll">
        <div className="w-full">
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="relative grid h-full w-full gap-2"
            >
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("project_name")}</FormLabel>
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
                    <FormLabel>{t("what_roles_do_you_need")}</FormLabel>
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
              <LoadingButton
                type="submit"
                className="w-full"
                loading={isPending}
              >
                {t("add")}
              </LoadingButton>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
