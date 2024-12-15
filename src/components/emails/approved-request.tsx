import * as React from "react";
import {
  Html,
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
};

function ApprovedRequestEmail({ projectName, requesterName }: Props) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className="m-0 bg-gray-50 p-0">
          <Container className="mx-auto max-w-[600px] p-5">
            <Section className="mb-8 rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
              <Heading className="m-0 text-3xl font-bold text-black">
                Great News! 🎉
              </Heading>
              <Text className="mt-2 text-lg text-black">
                Your collaboration request has been approved!
              </Text>
            </Section>

            <Section className="rounded-lg bg-white p-8 shadow-lg">
              <Heading className="m-0 text-2xl font-bold text-gray-800">
                Welcome to {projectName}
              </Heading>
              <Text className="mt-4 text-gray-600">
                Congratulations! {requesterName} has approved your request to
                join the project. You are now officially part of the{" "}
                {projectName} team.
              </Text>
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

export default ApprovedRequestEmail;
