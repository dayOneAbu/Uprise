import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";

import { db } from "~/server/db";

export const auth = betterAuth({
  basePath: "/api/auth",
  database: prismaAdapter(db, {
    provider: "postgresql", // or "sqlite" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  disablePaths: ["/is-username-available"],
  plugins: [
    username({
      minUsernameLength: 5,
      maxUsernameLength: 100
    })
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
      // NOTE: We must explicitly define these fields here for Better Auth to:
      // 1. Include them in the session.user type inference
      // 2. Fetch them from the database when creating a session
      // This fixes "Unsafe member access" lint errors on ctx.session.user
      successRate: {
        type: "number",
      },
      totalEarnings: {
        type: "number",
      },
      badge: {
        type: "string",
      },
      companyId: {
        type: "string",
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type Auth = typeof auth;
