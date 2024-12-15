import * as React from "react";
import {
  Html,
  Head,
  Body,
  Button,
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

function RejectedRequestEmail({ projectName, requesterName }: Props) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className="m-0 bg-gray-50 p-0">
          <Container className="mx-auto max-w-[600px] p-5">
            <Section className="mb-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 p-8 text-center text-white">
              <Heading className="m-0 text-3xl font-bold text-black">
                Update on Your Request
              </Heading>
              <Text className="mt-2 text-lg text-black">
                Regarding your collaboration request
              </Text>
            </Section>

            <Section className="rounded-lg bg-white p-8 shadow-lg">
              <Heading className="m-0 text-2xl font-bold text-gray-800">
                About {projectName}
              </Heading>
              <Text className="mt-4 text-gray-600">
                We regret to inform you that {requesterName} has decided not to
                move forward with your request to join {projectName} at this
                time. Don't be discouraged - there are many other exciting
                projects on Yazameet that could be a better fit.
              </Text>
              <Text className="mt-4 text-gray-600">
                We encourage you to continue exploring other collaboration
                opportunities that match your skills and interests.
              </Text>
              <Button
                href={`https://yazameet.vercel.app/projects`}
                className="mt-6 inline-block rounded-md bg-orange-600 px-6 py-3 text-center text-base font-medium text-white hover:bg-orange-700"
              >
                View Projects
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

export default RejectedRequestEmail;
