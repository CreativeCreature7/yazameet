"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { RequestStatus } from "@prisma/client";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface RequestActionsProps {
  requestId: number;
  projectId: number;
  status: RequestStatus;
}

export function RequestActions({
  requestId,
  projectId,
  status,
}: RequestActionsProps) {
  const t = useTranslations();
  const utils = api.useUtils();
  const router = useRouter();
  const { mutate: updateRequest } = api.project.updateRequest.useMutation({
    onSuccess: async () => {
      toast.success(t("request_updated_successfully"));
      setTimeout(() => {
        router.push(`/projects`);
      }, 1000);
    },
  });

  if (status !== "PENDING") {
    return (
      <Badge
        className={`${status === "APPROVED" ? "bg-green-500 text-white hover:bg-green-600" : "bg-red-500 text-white hover:bg-red-600"}`}
      >
        {t(status.toLowerCase())}
      </Badge>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row">
      <Button
        size="sm"
        variant="default"
        onClick={() => updateRequest({ id: requestId, status: "APPROVED" })}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => updateRequest({ id: requestId, status: "REJECTED" })}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
