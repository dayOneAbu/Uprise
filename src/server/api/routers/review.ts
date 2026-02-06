import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { reviewSchema } from "~/lib/schemas";

export const reviewRouter = createTRPCRouter({
    // --------------------------------------------------------------------------
    // CREATE REVIEW (Protected)
    // --------------------------------------------------------------------------
    create: protectedProcedure
        .input(reviewSchema)
        .mutation(async ({ ctx, input }) => {
            // 1. Get Contract
            const contract = await ctx.db.contract.findUnique({
                where: { id: input.contractId },
                include: { job: true }
            });
            if (!contract) throw new TRPCError({ code: "NOT_FOUND" });

            // 2. Identify roles
            // Reviewer = Me
            // Reviewee = The other party
            const myId = ctx.session.user.id;
            let revieweeId: string;

            if (myId === contract.internId) {
                // I am intern, reviewing employer (company? or specific user?)
                // Schema has revieweeId as User.
                // Usually intern reviews the Company/Job, but here it's User-to-User.
                // Let's assume we review the `employerId` on the Job or just the *Contract* context.
                // But `Review` model needs `revieweeId`.
                // Let's fetch job's employer.
                const job = await ctx.db.job.findUnique({ where: { id: contract.jobId } });
                if (!job) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
                revieweeId = job.employerId;
            } else {
                // I am employer, reviewing intern
                // Verify I am authorized for this job/company
                const user = await ctx.db.user.findUnique({
                    where: { id: myId },
                    select: { companyId: true }
                });
                if (user?.companyId !== contract.job.companyId) { // Simplified check
                    throw new TRPCError({ code: "FORBIDDEN" });
                }
                revieweeId = contract.internId;
            }

            // 3. Create Review
            const review = await ctx.db.review.create({
                data: {
                    contractId: input.contractId,
                    reviewerId: myId,
                    revieweeId: revieweeId,
                    rating: input.rating,
                    comment: input.comment,
                    privateScore: input.privateScore,
                }
            });

            // 4. Update Stats (Async or here)
            // We should recalculate successRate/badge for reviewee.
            // For hackathon, just do it simply or leave it for a trigger/cron.
            // Or simple aggregation:
            // const allReviews = await ctx.db.review.findMany({ where: { revieweeId } });
            // const avg = ...
            // await ctx.db.user.update(...)

            return review;
        }),
});
