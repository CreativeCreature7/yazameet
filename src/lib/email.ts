import React from "react";
import { Resend } from "resend";
import { env } from "@/env";

export const resend = new Resend(env.RESEND_API_KEY);

type EmailProps = {
  to: string;
  subject: string;
  react: React.ReactNode;
};

export const sendEmail = async ({ to, subject, react }: EmailProps) => {
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    react,
  });
};

export const sendBatchEmail = async (
  toList: string[],
  subject: string,
  react: React.ReactNode,
) => {
  const res = await resend.batch.send(
    toList.map((to) => ({
      from: env.EMAIL_FROM,
      to: [to],
      subject,
      react,
    })),
  );
  return res;
};
