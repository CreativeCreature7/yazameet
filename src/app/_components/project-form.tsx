"use client";

import { api } from "@/trpc/react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Option } from "@/components/ui/multi-select";
import { Roles, ProjectType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { optionRolesSchema, optionProjectTypeSchema } from "@/lib/schemas";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { TagSelect } from "@/components/ui/tag-select";

const BaseSchema = (t: (arg: string) => string) =>
  z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    rolesNeeded: z.array(optionRolesSchema).min(1),
    type: z.array(optionProjectTypeSchema).min(1),
  });

type props = {
  values?: z.infer<ReturnType<typeof BaseSchema>>;
  id?: number;
  defaultType?: ProjectType;
};

export function ProjectForm({ values, id, defaultType }: props) {
  const t = useTranslations();
  const session = useSession();
  const [openDialog, setOpenDialog] = useState(false);
  const formSchema = BaseSchema(t);
  const defaultValues = {
    name: "",
    description: "",
    rolesNeeded: [],
    type: defaultType ? [{ label: t(defaultType), value: defaultType }] : [],
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: values ?? defaultValues,
  });

  const OPTIONS_ROLES: Option[] = Object.values(Roles).map((value) => ({
    label: t(value),
    value,
  }));

  const OPTIONS_PROJECT_TYPE: Option[] = Object.values(ProjectType)
    .filter((type) => !defaultType || type === defaultType)
    .map((value) => ({
      label: t(value),
      value,
      disable: defaultType ? value !== defaultType : false,
    }));

  const utils = api.useUtils();
  const { mutate: createProject, isPending } = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      form.reset();
      values = undefined;
      setOpenDialog(false);
      id
        ? toast.success(t("project_updated_successfully"))
        : toast.success(t("project_added_successfully"));
    },
  });

  const { mutate: deleteProject } = api.project.delete.useMutation({
    onSuccess: async () => {
      await utils.project.invalidate();
      setOpenDialog(false);
      toast.success(t("project_deleted_successfully"));
    },
  });

  const handleDelete = () => {
    if (!id) return;
    if (window.confirm(t("confirm_delete_project"))) {
      deleteProject({ id });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedValues = {
      ...values,
      rolesNeeded: values.rolesNeeded.map((role) => role.value),
      type: values.type.map((type) => type.value),
      id,
    };
    createProject(updatedValues);
  }

  return (
    <Dialog open={openDialog} onOpenChange={() => setOpenDialog(!openDialog)}>
      <DialogTrigger asChild>
        {!id ? (
          <Button
            variant="expandIcon"
            iconPlacement="right"
            Icon={PlusIcon}
            disabled={!session?.data?.user}
          >
            {t("add_new_project")}
          </Button>
        ) : (
          <Button variant="ringHover" className="rounded-full p-2">
            <PencilIcon className="h-6 w-6" />
          </Button>
        )}
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
                  <FormItem>
                    <FormLabel>{t("what_roles_do_you_need")}</FormLabel>
                    <FormControl>
                      <TagSelect
                        options={Object.values(Roles)}
                        selectedOptions={field.value.map((role) => role.value)}
                        onChange={(selected) => {
                          field.onChange(
                            selected.map((value) => ({
                              value,
                              label: t(value),
                            })),
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!defaultType && (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("what_type_of_project_is_this")}</FormLabel>
                      <FormControl>
                        <TagSelect
                          options={Object.values(ProjectType).filter(
                            (type) => !defaultType || type === defaultType,
                          )}
                          selectedOptions={field.value.map(
                            (type) => type.value,
                          )}
                          onChange={(selected) => {
                            field.onChange(
                              selected.map((value) => ({
                                value,
                                label: t(value),
                                disable: defaultType
                                  ? value !== defaultType
                                  : false,
                              })),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="mt-4 flex justify-between">
                <LoadingButton
                  type="submit"
                  loading={isPending}
                  className="w-full"
                >
                  {id ? t("update_project") : t("add_new_project")}
                </LoadingButton>
                {id && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="ms-2"
                    onClick={handleDelete}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
