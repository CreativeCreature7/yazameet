import { withAuth } from "next-auth/middleware";
import { env } from "@/env";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => token?.email === env.ADMIN_EMAIL,
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
