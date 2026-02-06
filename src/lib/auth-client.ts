import { createAuthClient } from "better-auth/react";
import type { Auth } from "~/server/better-auth/config";

// @ts-expect-error - Type mismatch in library
export const authClient = createAuthClient<Auth>({
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
});
