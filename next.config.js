/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "yazameet.s3.eu-central-1.amazonaws.com",
      },
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

export default withNextIntl(config);
