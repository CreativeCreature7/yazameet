"use client";

import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Download, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RequestStatus } from "@prisma/client";

export default function RequestsPage() {
  const t = useTranslations();

  const { data: projects, isLoading: isLoadingProjects } =
    api.project.getMyProjects.useQuery();

  const { data: requests, isLoading: isLoadingRequests } =
    api.project.getAllContactRequests.useQuery(
      { projectIds: projects?.map((p) => p.id) ?? [] },
      { enabled: !!projects?.length },
    );

  const utils = api.useUtils();
  const { mutate: updateStatus } =
    api.project.updateContactRequestStatus.useMutation({
      onSuccess: () => {
        toast.success(t("request_updated_successfully"));
        void utils.project.getAllContactRequests.invalidate();
      },
    });

  const handleStatusUpdate = (
    requestId: number,
    status: Extract<RequestStatus, "APPROVED" | "REJECTED">,
  ) => {
    updateStatus({ requestId, status });
  };

  const handleDownloadCV = (cvUrl: string, userName: string) => {
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = `${userName}_CV.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoadingProjects || isLoadingRequests) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-8 w-64" />
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold">{t("contact_requests")}</h1>
        <p className="mt-4 text-muted-foreground">{t("no_requests")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-40">
      <h1 className="text-3xl font-bold">{t("contact_requests")}</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{request.user.name}</CardTitle>
                  <CardDescription>{request.user.email}</CardDescription>
                </div>
                <Badge
                  variant={
                    request.status === "PENDING"
                      ? "default"
                      : request.status === "APPROVED"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {t(request.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{t("purpose_of_contact")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {request.purpose}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">{t("interested_roles")}</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {request.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {t(role)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">{t("additional_notes")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {request.notes}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadCV(request.cvUrl, request.user.name ?? "")
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("download_cv")}
                  </Button>
                  {request.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusUpdate(request.id, "APPROVED")
                        }
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t("approve")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatusUpdate(request.id, "REJECTED")
                        }
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {t("reject")}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {format(new Date(request.createdAt), "PPp")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
