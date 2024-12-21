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
import { Download, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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
  const { mutate: addCollaborator } = api.project.addCollaborator.useMutation({
    onSuccess: () => {
      toast.success(t("collaborator_added_successfully"));
      void utils.project.getAllContactRequests.invalidate();
    },
  });

  const handleAddCollaborator = (request: any) => {
    addCollaborator({
      id: request.project.id,
      userId: request.user.id,
      roles: request.roles,
    });
  };

  const handleDownloadCV = (cvUrl: string, userName: string) => {
    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = `${userName}_CV.pdf`;
    link.target = "_blank"; // Open in new tab
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoadingProjects || isLoadingRequests) {
    return (
      <div className="container mx-auto py-40">
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
      <div className="container mx-auto py-40">
        <h1 className="text-3xl font-bold">{t("contact_requests")}</h1>
        <p className="mt-4 text-muted-foreground">{t("no_requests")}</p>
      </div>
    );
  }

  return (
    <div className="container py-16 md:py-40">
      <h1 className="text-3xl font-bold">{t("contact_requests")}</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <CardDescription className="mb-2 text-center text-3xl font-medium text-foreground">
                    {request.project.name}
                  </CardDescription>
                  <CardTitle>{request.user.name}</CardTitle>
                  <CardDescription>{request.user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{t("purpose_of_contact")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(request.purpose)}
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
                {request.cvUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadCV(
                        request.cvUrl ?? "",
                        request.user.name ?? "",
                      )
                    }
                  >
                    <Download className="me-2 h-4 w-4" />
                    {t("download_cv")}
                  </Button>
                )}
                {!request.addedToProject && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      onClick={() => handleAddCollaborator(request)}
                      className="w-full"
                    >
                      <CheckCircle className="me-2 flex h-4 w-4" />
                      {t("add_to_project")}
                    </Button>
                  </div>
                )}
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
