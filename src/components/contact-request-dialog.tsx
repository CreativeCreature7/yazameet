"use client";

import { api } from "@/trpc/react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { TagSelect } from "@/components/ui/tag-select";
import { Roles } from "@prisma/client";
import {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";

const BaseSchema = (t: (arg: string) => string) =>
  z.object({
    notes: z.string().min(1),
    roles: z
      .array(
        z.object({
          value: z.nativeEnum(Roles),
          label: z.string(),
        }),
      )
      .min(1),
    cv: z.array(z.instanceof(File)).min(1),
    purpose: z.string().min(1),
  });

type Props = {
  projectId: number;
};

export function ContactRequestDialog({ projectId }: Props) {
  const t = useTranslations();
  const session = useSession();
  const [openDialog, setOpenDialog] = useState(false);
  const formSchema = BaseSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
      roles: [],
      cv: [],
      purpose: "",
    },
  });

  const utils = api.useUtils();
  const { mutate: submitRequest, isPending } =
    api.project.submitContactRequest.useMutation({
      onSuccess: async () => {
        setOpenDialog(false);
        toast.success(t("contact_request_sent"));
        await utils.project.invalidate();
        form.reset();
      },
    });

  const { mutateAsync: getPresignedUrl } =
    api.media.getPresignedUrl.useMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const file = values.cv[0];
    const { uploadURL } = await getPresignedUrl({
      fileName: file?.name ?? "",
      fileType: file?.type ?? "",
    });

    const { status } = await fetch(uploadURL, {
      method: "PUT",
      body: file,
      headers: {
        "Content-type": file?.type ?? "",
      },
    });

    if (status !== 200) {
      toast.error(t("error_uploading_file"));
      return;
    }

    const cvUrl = uploadURL.split("?")[0] ?? "";

    submitRequest({
      projectId,
      notes: values.notes,
      roles: values.roles.map((role) => role.value),
      purpose: values.purpose,
      cv: cvUrl,
    });
  }

  const dropZoneConfig = {
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  };

  return (
    <Dialog open={openDialog} onOpenChange={() => setOpenDialog(!openDialog)}>
      <DialogTrigger asChild>
        <Button
          variant="expandIcon"
          iconPlacement="right"
          Icon={MessageCircle}
          disabled={!session?.data?.user}
        >
          {t("contact_project")}
        </Button>
      </DialogTrigger>
      <DialogContent className="hidden-scrollbar overflow-y-scroll">
        <div className="w-full">
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="relative grid h-full w-full gap-4"
            >
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("purpose_of_contact")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("purpose_placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("interested_roles")}</FormLabel>
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

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("additional_notes")}</FormLabel>
                    <FormControl>
                      <AutosizeTextarea
                        placeholder={t("notes_placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload_cv")}</FormLabel>
                    <FileUploader
                      value={field.value}
                      onValueChange={field.onChange}
                      dropzoneOptions={dropZoneConfig}
                      reSelect={true}
                    >
                      <FileInput className="outline-dashed outline-1 outline-black dark:outline-white">
                        <div className="flex w-full flex-col items-center justify-center p-4">
                          <p className="text-sm text-muted-foreground">
                            {t("drag_drop_cv")}
                          </p>
                        </div>
                      </FileInput>
                      {field.value && field.value.length > 0 && (
                        <FileUploaderContent>
                          {field.value.map((file, i) => (
                            <FileUploaderItem
                              key={i}
                              index={i}
                              className="w-full"
                            >
                              {file.name}
                            </FileUploaderItem>
                          ))}
                        </FileUploaderContent>
                      )}
                    </FileUploader>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <LoadingButton
                type="submit"
                className="w-full"
                loading={isPending}
              >
                {t("send_request")}
              </LoadingButton>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
