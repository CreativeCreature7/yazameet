"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/components/ui/file-upload";
import { Paperclip } from "lucide-react";
import MultiSelect, { Option } from "@/components/ui/multi-select";
import { useTranslations } from "next-intl";
import { Roles } from "@prisma/client";

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

const FileUploaderTest = () => {
  const [files, setFiles] = useState<File[] | null>(null);

  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  return (
    <FileUploader
      value={files}
      onValueChange={setFiles}
      dropzoneOptions={dropZoneConfig}
      className="relative rounded-lg bg-background p-2"
    >
      <FileInput className="outline-dashed outline-1 outline-black dark:outline-white">
        <div className="flex w-full flex-col items-center justify-center pb-4 pt-3">
          <FileSvgDraw />
        </div>
      </FileInput>
      <FileUploaderContent>
        {files &&
          files.length > 0 &&
          files.map((file, i) => (
            <FileUploaderItem key={i} index={i}>
              <Paperclip className="h-4 w-4 stroke-current" />
              <span>{file.name}</span>
            </FileUploaderItem>
          ))}
      </FileUploaderContent>
    </FileUploader>
  );
};

export default function SignUp() {
  const t = useTranslations();

  const OPTIONS: Option[] = Object.values(Roles).map((value) => ({
    label: t(value),
    value,
  }));

  return (
    <Card className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 md:mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{t("profile_details")}</CardTitle>
        <CardDescription>{t("in_order_to_continue")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">{t("full_name")}</Label>
              <Input id="full-name" placeholder={t("tyler_durden")} required />
            </div>
            <div className="grid gap-2">
              <Label>{t("year")}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t("select_year")} />
                </SelectTrigger>
                <SelectContent className="w-[180px]">
                  <SelectItem value="1">{t("year_1")}</SelectItem>
                  <SelectItem value="2">{t("year_2")}</SelectItem>
                  <SelectItem value="3">{t("year_3")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t("profile_picture")}</Label>
            <FileUploaderTest />
          </div>
          <div className="grid gap-2">
            <div className="w-full">
              <Label>{t("what_are_your_roles")}</Label>
              <MultiSelect
                defaultOptions={OPTIONS}
                placeholder={t("select_your_roles")}
                emptyIndicator={
                  <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                    {t("no_results")}
                  </p>
                }
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            {t("join")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
