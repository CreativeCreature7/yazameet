"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";

export default function NewIdeationSession() {
  const router = useRouter();
  const [sessionName, setSessionName] = useState("");
  const [isTeamSession, setIsTeamSession] = useState(false);
  const [teamMembers, setTeamMembers] = useState("");
  const t = useTranslations("ideas.new_session");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a session ID (in a real app, this would be created on the server)
    const sessionId = Date.now().toString();

    // Navigate to the active session
    router.push(
      `/ideas/session/${sessionId}?name=${encodeURIComponent(sessionName)}&team=${isTeamSession}`,
    );
  };

  return (
    <div className="container max-w-md py-8">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sessionName">{t("session_name")}</Label>
            <Input
              id="sessionName"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder={t("session_name_placeholder")}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="teamSession"
              checked={isTeamSession}
              onCheckedChange={setIsTeamSession}
            />
            <Label htmlFor="teamSession">{t("team_session")}</Label>
          </div>

          {isTeamSession && (
            <div className="space-y-2">
              <Label htmlFor="teamMembers">{t("team_members")}</Label>
              <Input
                id="teamMembers"
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                placeholder={t("team_members_placeholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("team_members_help")}
              </p>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" className="w-full">
              {t("start_session")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
