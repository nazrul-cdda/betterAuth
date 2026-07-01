import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/auth-schema";
import { sendEmail } from "./email";
import { openAPI, organization } from "better-auth/plugins";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,
        revokeSessionsOnPasswordReset: true, 
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }, request) => {
            void sendEmail({
                to: user.email,
                subject: "Reset your password",
                text: `Click the link to reset your password: ${url}`,
            });
        },
        onExistingUserSignUp: async ({ user }, request) => {
            void sendEmail({
                to: user.email,
                subject: "Someone tried to sign up with your email",
                text: `Hi ${user.name}, someone just tried to create an account using your email address. If this wasn't you, no action is needed.`,
            });
        },
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
    plugins: [nextCookies(), openAPI(), organization()],
});