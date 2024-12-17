import * as React from "react";
import {
  Html,
  Button,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
  Tailwind,
} from "@react-email/components";

type Props = {
  projectName: string;
  requesterName: string;
  requestUrl: string;
};

function ContactRequestEmail({ projectName, requesterName, requestUrl }: Props) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-8">
            <Section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <Heading className="mb-4 text-2xl font-bold text-gray-800">
                New Contact Request for {projectName}
              </Heading>

              <Text className="mb-4 text-gray-600">
                Hello,
                <br />
                <br />
                {requesterName} has sent a contact request for your project{" "}
                <strong>{projectName}</strong>.
              </Text>

              <Section className="mb-6">
                <Button
                  className="rounded-lg bg-orange-500 px-6 py-3 text-center text-white"
                  href={requestUrl}
                >
                  View Request Details
                </Button>
              </Section>

              <Text className="text-sm text-gray-500">
                You can review the request details, including their CV and purpose of contact, by clicking the button above or visiting your project dashboard.
              </Text>

              <Section className="mt-8 text-center text-sm text-gray-600">
                <Text className="mb-4">
                  Best regards,
                  <br />
                  The Yazameet Team
                </Text>
                <Text>
                  If you have any questions, feel free to contact us at{" "}
                  <Link
                    href="mailto:guybh200211@gmail.com"
                    className="text-orange-500 hover:text-orange-600"
                  >
                    guybh200211@gmail.com
                  </Link>
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default ContactRequestEmail; 