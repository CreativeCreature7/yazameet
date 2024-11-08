import { inngest } from "@/lib/inngest";
import { db } from "@/server/db";
import NewProjectEmail from "@/components/emails/new-project";
import { sendBatchEmail } from "@/lib/email";

export const Event_NEW_PROJECT = "project/created";

export const sendNewProjectEmails = inngest.createFunction(
  { id: "send-new-project-emails" },
  { event: Event_NEW_PROJECT },
  async ({ event }) => {
    const users = await db.user.findMany({
      where: {
        roles: {
          hasSome: event.data.roles,
        },
      },
    });

    const emails = users?.map((user) => user.email ?? "") ?? [];
    const chunkSize = 100;

    for (let i = 0; i < emails.length; i += chunkSize) {
      const chunk = emails.slice(i, i + chunkSize);
      const res = await sendBatchEmail(
        chunk,
        "New Project is waiting for you in Yazameet",
        NewProjectEmail({
          projectUrl: event.data.url,
        }),
      );
    }
    return { event, body: "Bulk emails sent" };
  },
);
