"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function NewIdeationSession() {
  const router = useRouter();
  const [sessionName, setSessionName] = useState("");
  const [isTeamSession, setIsTeamSession] = useState(false);
  const [teamMembers, setTeamMembers] = useState("");

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
      <h1 className="mb-6 text-2xl font-bold">New Ideation Session</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sessionName">Session Name</Label>
            <Input
              id="sessionName"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter a name for this ideation session"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="teamSession"
              checked={isTeamSession}
              onCheckedChange={setIsTeamSession}
            />
            <Label htmlFor="teamSession">Team Session</Label>
          </div>

          {isTeamSession && (
            <div className="space-y-2">
              <Label htmlFor="teamMembers">
                Team Members (emails, comma-separated)
              </Label>
              <Input
                id="teamMembers"
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                placeholder="teammate1@example.com, teammate2@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Team members will receive an invitation to join this session.
              </p>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" className="w-full">
              Start Session
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
