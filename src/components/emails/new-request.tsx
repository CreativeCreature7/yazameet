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

function NewRequestEmail({ projectName, requesterName, requestUrl }: Props) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className="m-0 bg-gray-50 p-0">
          <Container className="mx-auto max-w-[600px] p-5">
            <Section className="mb-8 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 p-8 text-center text-white">
              <Heading className="m-0 text-3xl font-bold text-black">
                New Collaboration Request! 🤝
              </Heading>
              <Text className="mt-2 text-lg text-black">
                Someone wants to collaborate with you on your project
              </Text>
            </Section>

            <Section className="rounded-lg bg-white p-8 shadow-lg">
              <Heading className="m-0 text-2xl font-bold text-gray-800">
                Collaboration Request for {projectName}
              </Heading>
              <Text className="mt-4 text-gray-600">
                {requesterName} is interested in collaborating on your project.
                They've submitted a request to join your team and contribute
                their skills to help make your project a success.
              </Text>
              <Text className="text-gray-600">
                Review their profile and request details to see if they'd be a
                good fit for your project.
              </Text>
              <Button
                href={requestUrl}
                className="mt-6 inline-block rounded-md bg-orange-600 px-6 py-3 text-center text-base font-medium text-white hover:bg-orange-700"
              >
                Review Request
              </Button>
            </Section>

            <Section className="mt-8 text-center text-sm text-gray-600">
              <Text className="mb-4">
                Best regards,
                <br />
                The Yazameet Team
              </Text>
              <Text>
                If you have any questions, feel free to contact us at
                <Link
                  href="mailto:guybh200211@gmail.com"
                  className="text-orange-500 hover:text-orange-600"
                >
                  guybh200211@gmail.com
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default NewRequestEmail;
