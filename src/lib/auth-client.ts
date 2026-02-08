import { createAuthClient } from "better-auth/react";
import type { Auth } from "~/server/better-auth/config";

import { env } from "~/env";

// @ts-expect-error - Type mismatch in library
export const authClient = createAuthClient<Auth>({
    baseURL: env.NEXT_PUBLIC_APP_URL
});
