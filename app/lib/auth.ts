import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/auth-schema";
import { sendEmail } from "./email";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
          const modifiedURL = new URL(url);
          modifiedURL.searchParams.set("callbackURL", "/dashboard");
          void sendEmail({
              to: user.email,
              subject: "Verify your email address",
              text: `Click the link to verify your email: ${modifiedURL}`,
          });
      },
    },
    plugins: [nextCookies(), openAPI()],
});