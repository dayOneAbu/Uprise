
import { userRouter } from "~/server/api/routers/user";
import { profileRouter } from "~/server/api/routers/profile";
import { companyRouter } from "~/server/api/routers/company";
import { jobRouter } from "~/server/api/routers/job";
import { applicationRouter } from "~/server/api/routers/application";
import { contractRouter } from "~/server/api/routers/contract";
import { reviewRouter } from "~/server/api/routers/review";
import { aiRouter } from "~/server/api/routers/ai";
import { challengeRouter } from "~/server/api/routers/challenge";
import { submissionRouter } from "~/server/api/routers/submission";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  profile: profileRouter,
  company: companyRouter,
  job: jobRouter,
  application: applicationRouter,
  contract: contractRouter,
  review: reviewRouter,
  ai: aiRouter,
  challenge: challengeRouter,
  submission: submissionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
