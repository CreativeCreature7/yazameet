"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/components/ui/file-upload";
import { Option } from "@/components/ui/multi-select";
import { useTranslations } from "next-intl";
import { Roles, Year } from "@prisma/client";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import {
  optionRolesSchema,
  PROFILE_MAX_FILE_SIZE,
  profilePictureSchema,
} from "@/lib/schemas";
import { api } from "@/trpc/react";
import { DropzoneOptions } from "react-dropzone";
import { LoadingButton } from "@/components/ui/loading-button";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { TagSelect } from "@/components/ui/tag-select";

const FileSvgDraw = () => {
  const t = useTranslations();
  return (
    <>
      <svg
        className="mb-3 h-8 w-8 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">{t("click_to_upload")}</span>{" "}
        {t("or_drag_and_drop")}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t("png_jpg_or_gif")}
      </p>
    </>
  );
};

const BaseSchema = (t: (arg: string) => string) =>
  z.object({
    profilePicture: profilePictureSchema,
    roles: z.array(optionRolesSchema).min(1),
    fullName: z.string().min(1),
    year: z.nativeEnum(Year),
  });

export default function SignUp() {
  const t = useTranslations();
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const OPTIONS: Option[] = Object.values(Roles).map((value) => ({
    label: t(value),
    value,
  }));
  const formSchema = BaseSchema(t);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roles: [],
      fullName: "",
      profilePicture: [],
    },
  });
  const dropZoneConfig: DropzoneOptions = {
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    maxSize: PROFILE_MAX_FILE_SIZE,
    multiple: true,
  };

  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");

  const { mutate: addDetails } = api.user.addDetails.useMutation();
  const { mutateAsync: getPresignedUrl } =
    api.media.getPresignedUrl.useMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    let profilePictureUrl = "";

    if (values.profilePicture?.[0]) {
      const file = values.profilePicture[0];
      const { uploadURL } = await getPresignedUrl({
        fileName: file.name,
        fileType: file.type,
      });

      const { status } = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-type": file.type,
        },
      });

      if (status === 200) {
        profilePictureUrl = uploadURL.split("?")[0] ?? "";
      }
    }

    const updatedValues = profilePictureUrl
      ? {
          ...values,
          profilePicture: profilePictureUrl ?? undefined,
          roles: values.roles.map((role) => role.value),
        }
      : {
          ...values,
          profilePicture: undefined,
          roles: values.roles.map((role) => role.value),
        };

    addDetails(updatedValues);
    router.replace(callbackUrl ?? "/projects");
    updateSession();
    setIsLoading(false);
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Card className="mt-16 max-w-sm xl:mt-40">
        <CardHeader>
          <CardTitle className="text-2xl">{t("profile_details")}</CardTitle>
          <CardDescription>{t("in_order_to_continue")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="relative grid w-full gap-2"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("full_name")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("tyler_durden")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("year")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("select_year")} />
                              </SelectTrigger>
                            </FormControl>
                            {Year && (
                              <SelectContent className="w-[180px]">
                                <SelectItem value={Year.FIRSTYEAR}>
                                  {t(Year.FIRSTYEAR)}
                                </SelectItem>
                                <SelectItem value={Year.SECONDYEAR}>
                                  {t(Year.SECONDYEAR)}
                                </SelectItem>
                                <SelectItem value={Year.THIRDYEAR}>
                                  {t(Year.THIRDYEAR)}
                                </SelectItem>
                                <SelectItem value={Year.FOURTHYEAR}>
                                  {t(Year.FOURTHYEAR)}
                                </SelectItem>
                              </SelectContent>
                            )}
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("what_are_your_roles")}</FormLabel>
                        <FormControl>
                          <TagSelect
                            options={Object.values(Roles)}
                            selectedOptions={field.value.map(
                              (role) => role.value,
                            )}
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
                  <div
                    className={`flex w-full flex-col items-start gap-4 rounded-md px-2 pb-1 ${
                      form.watch("profilePicture") !== null ? "pt-4" : "pt-2"
                    }`}
                  >
                    <FormLabel>{t("profile_picture")}</FormLabel>
                    <FormField
                      control={form.control}
                      name="profilePicture"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FileUploader
                            value={field.value ?? []}
                            onValueChange={field.onChange}
                            dropzoneOptions={dropZoneConfig}
                            reSelect={true}
                            className="w-full"
                          >
                            <FileInput className="outline-dashed outline-1 outline-black dark:outline-white">
                              <div className="flex w-full flex-col items-center justify-center pb-4 pt-3">
                                <FileSvgDraw />
                              </div>
                            </FileInput>
                            {field.value && field.value.length > 0 && (
                              <FileUploaderContent className="w-full flex-row justify-center gap-2 rounded-b-none rounded-t-md p-2">
                                {field.value.map((file, i) => (
                                  <FileUploaderItem
                                    key={i}
                                    index={i}
                                    aria-roledescription={`file ${i + 1} containing ${
                                      file.name
                                    }`}
                                    className="size-20 p-0"
                                  >
                                    <AspectRatio className="size-full">
                                      <Image
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="rounded-full object-cover"
                                        fill
                                      />
                                    </AspectRatio>
                                  </FileUploaderItem>
                                ))}
                              </FileUploaderContent>
                            )}
                          </FileUploader>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <LoadingButton
                    type="submit"
                    className="w-full"
                    loading={isLoading}
                  >
                    {t("join")}
                  </LoadingButton>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
