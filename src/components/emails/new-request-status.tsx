import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

interface NewRequestStatusEmailProps {
  projectName: string;
  status: "APPROVED" | "REJECTED";
}

export default function NewRequestStatusEmail({
  projectName,
  status,
}: NewRequestStatusEmailProps) {
       return (
    <Html>
      <Head />
      <Preview>
        Your collaboration request for {projectName} has been{" "}
        {status.toLowerCase()}
      </Preview>
      <Body style={main}>
        <Container>
          <Heading>Collaboration Request {status.toLowerCase()}</Heading>
          <Text>
            Your request to collaborate on project "{projectName}" has been{" "}
            {status.toLowerCase()}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};
