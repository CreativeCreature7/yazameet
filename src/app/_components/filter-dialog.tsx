"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { Option } from "@/components/ui/multi-select";
import { ProjectType, Roles } from "@prisma/client";
import { TagSelect } from "@/components/ui/tag-select";

type Props = {
  selectedTypes?: Option[];
  setSelectedTypes?: (types: Option[]) => void;
  selectedRoles: Option[];
  setSelectedRoles: (roles: Option[]) => void;
  hideTypeFilter?: boolean;
};

export function FilterDialog({
  selectedTypes,
  setSelectedTypes,
  selectedRoles,
  setSelectedRoles,
  hideTypeFilter,
}: Props) {
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
          variant="outline"
          size="icon"
          className="absolute top-1/2 -translate-y-1/2 transform border-none bg-transparent hover:bg-transparent ltr:right-3 rtl:left-3"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("filter")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {!hideTypeFilter && selectedTypes && setSelectedTypes && (
            <div>
              <h4 className="mb-2 text-sm font-medium">{t("project_type")}</h4>
              <TagSelect
                options={OPTIONS_PROJECT_TYPE.map(o => o.value as string)}
                selectedOptions={selectedTypes.map(o => o.value as string)}
                onChange={(values) => {
                  const newSelected = values.map(value => 
                    OPTIONS_PROJECT_TYPE.find(o => o.value === value)!
                  );
                  setSelectedTypes(newSelected);
                }}
              />
            </div>
          )}
          <div>
            <h4 className="mb-2 text-sm font-medium">{t("roles")}</h4>
            <TagSelect
              options={OPTIONS_ROLES.map(o => o.value as string)}
              selectedOptions={selectedRoles.map(o => o.value as string)}
              onChange={(values) => {
                const newSelected = values.map(value => 
                  OPTIONS_ROLES.find(o => o.value === value)!
                );
                setSelectedRoles(newSelected);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
