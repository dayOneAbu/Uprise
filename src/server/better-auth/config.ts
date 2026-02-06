import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";

import { db } from "~/server/db";

export const auth = betterAuth({
  basePath: "/api/auth",
  database: prismaAdapter(db, {
    provider: "sqlite", // or "sqlite" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    
  },
   disablePaths: ["/is-username-available"],
  plugins: [
    username({
      minUsernameLength: 5,
      maxUsernameLength: 100
    })
  ],
});

export type Session = typeof auth.$Infer.Session;
