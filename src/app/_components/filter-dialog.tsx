// src/app/_components/filter-dialog.tsx
"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import MultiSelect, { Option } from "@/components/ui/multi-select";
import { ProjectType, Roles } from "@prisma/client";
import { useTranslations } from "next-intl";

interface FilterDialogProps {
  selectedTypes: Option[];
  setSelectedTypes: (types: Option[]) => void;
  selectedRoles: Option[];
  setSelectedRoles: (roles: Option[]) => void;
}

export function FilterDialog({
  selectedTypes,
  setSelectedTypes,
  selectedRoles,
  setSelectedRoles,
}: FilterDialogProps) {
  const t = useTranslations();

  const OPTIONS_ROLES: Option[] = Object.values(Roles).map((value) => ({
    label: t(value),
    value,
  }));

  const OPTIONS_PROJECT_TYPE: Option[] = Object.values(ProjectType).map(
    (value) => ({
      label: t(value),
      value,
    }),
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 -translate-y-1/2 ltr:right-0 rtl:left-0"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <MultiSelect
              value={selectedTypes}
              onChange={setSelectedTypes}
              defaultOptions={OPTIONS_PROJECT_TYPE}
              placeholder={t("filter_by_project_type")}
            />
            <MultiSelect
              value={selectedRoles}
              onChange={setSelectedRoles}
              defaultOptions={OPTIONS_ROLES}
              placeholder={t("filter_by_roles_needed")}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
