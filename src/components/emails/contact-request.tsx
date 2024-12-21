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
import { ContactPurpose } from "@prisma/client";

interface ContactRequestEmailProps {
  projectName: string;
  requesterName: string;
  purpose: ContactPurpose;
  requestUrl: string;
}

export default function ContactRequestEmail({
  projectName,
  requesterName,
  purpose,
  requestUrl,
}: ContactRequestEmailProps) {
  const getPurposeMessage = () => {
    switch (purpose) {
      case ContactPurpose.MOREDETAILS:
        return `${requesterName} is interested in learning more details about your project "${projectName}". They would like to understand more about the project's scope, goals, and requirements.`;
      case ContactPurpose.COLLAB:
        return `${requesterName} is excited about the possibility of collaborating on "${projectName}". They're interested in joining forces and contributing to the project's success.`;
      case ContactPurpose.MEETFORCOFFEE:
        return `${requesterName} would love to meet for coffee to discuss "${projectName}" in person. They're interested in having a casual conversation about the project and potential opportunities.`;
      default:
        return `${requesterName} has shown interest in your project "${projectName}".`;
    }
  };

  return (
    <Html>
      <Head />
      <Preview>New Contact Request for {projectName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Contact Request</Heading>
          <Text style={text}>Hello,</Text>
          <Text style={text}>{getPurposeMessage()}</Text>
          <Text style={text}>
            You can view and respond to this request by clicking the button below:
          </Text>
          <Link style={button} href={requestUrl}>
            View Request
          </Link>
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

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
  margin: "28px 0",
}; 