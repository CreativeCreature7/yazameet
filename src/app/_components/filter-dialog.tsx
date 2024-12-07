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
import { Badge } from "@/components/ui/badge";

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
          className="absolute top-1/2 -translate-y-1/2 transform border-none bg-transparent ltr:right-3 rtl:left-3 hover:bg-transparent"
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
              <div className="flex flex-wrap gap-2">
                {OPTIONS_PROJECT_TYPE.map((type) => (
                  <Badge
                    key={type.value}
                    variant={
                      selectedTypes.some(
                        (selectedType) => selectedType.value === type.value,
                      )
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      if (
                        selectedTypes.some(
                          (selectedType) => selectedType.value === type.value,
                        )
                      ) {
                        setSelectedTypes(
                          selectedTypes.filter(
                            (selectedType) => selectedType.value !== type.value,
                          ),
                        );
                      } else {
                        setSelectedTypes([...selectedTypes, type]);
                      }
                    }}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <h4 className="mb-2 text-sm font-medium">{t("roles")}</h4>
            <div className="flex flex-wrap gap-2">
              {OPTIONS_ROLES.map((role) => (
                <Badge
                  key={role.value}
                  variant={
                    selectedRoles.some(
                      (selectedRole) => selectedRole.value === role.value,
                    )
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => {
                    if (
                      selectedRoles.some(
                        (selectedRole) => selectedRole.value === role.value,
                      )
                    ) {
                      setSelectedRoles(
                        selectedRoles.filter(
                          (selectedRole) => selectedRole.value !== role.value,
                        ),
                      );
                    } else {
                      setSelectedRoles([...selectedRoles, role]);
                    }
                  }}
                >
                  {role.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
