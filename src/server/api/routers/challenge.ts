import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole, ChallengeType } from "../../../../generated/prisma";

const challengeSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    type: z.nativeEnum(ChallengeType),
    jobId: z.string().optional(),
    timeLimit: z.number().min(5).max(180).optional(), // 5 min to 3 hours
    tasks: z.array(z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        rubric: z.string().optional(), // JSON grading criteria
    })).min(1),
});

const updateChallengeSchema = challengeSchema.extend({
    id: z.string(),
});

const byIdSchema = z.object({ id: z.string() });

export const challengeRouter = createTRPCRouter({
    // --------------------------------------------------------------------------
    // CREATE CHALLENGE (Protected - Employer Only)
    // --------------------------------------------------------------------------
    create: protectedProcedure
        .input(challengeSchema)
        .mutation(async ({ ctx, input }) => {
            // 1. Verify access
            if (ctx.session.user.role !== UserRole.EMPLOYER && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only employers can create challenges" });
            }

            // 2. Verify job ownership if jobId provided
            if (input.jobId) {
                const job = await ctx.db.job.findUnique({
                    where: { id: input.jobId },
                    select: { employerId: true },
                });
                if (!job || (job.employerId !== ctx.session.user.id && ctx.session.user.role !== UserRole.ADMIN)) {
                    throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized for this job" });
                }
            }

            return ctx.db.challenge.create({
                data: {
                    title: input.title,
                    description: input.description,
                    type: input.type,
                    employerId: ctx.session.user.id,
                    jobId: input.jobId,
                    timeLimit: input.timeLimit,
                    isPublished: false,
                    tasks: {
                        create: input.tasks.map((task, index) => ({
                            title: task.title,
                            description: task.description,
                            rubric: task.rubric,
                            order: index,
                        })),
                    },
                },
                include: { tasks: true },
            });
        }),

    // --------------------------------------------------------------------------
    // GET CHALLENGE (Public - for candidates to view)
    // --------------------------------------------------------------------------
    get: publicProcedure
        .input(byIdSchema)
        .query(async ({ ctx, input }) => {
            const challenge = await ctx.db.challenge.findUnique({
                where: { id: input.id, isPublished: true },
                include: {
                    tasks: { orderBy: { order: 'asc' } },
                    employer: { select: { name: true, image: true } },
                    job: { select: { title: true, company: { select: { name: true } } } },
                },
            });

            if (!challenge) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
            }

            return challenge;
        }),

    // --------------------------------------------------------------------------
    // LIST CHALLENGES (Public - for candidates to discover)
    // --------------------------------------------------------------------------
    list: publicProcedure
        .query(async ({ ctx }) => {
            const challenges = await ctx.db.challenge.findMany({
                where: { isPublished: true },
                orderBy: { createdAt: 'desc' },
                include: {
                    employer: { select: { name: true, image: true } },
                    job: { select: { title: true, company: { select: { name: true } } } },
                    _count: { select: { submissions: true } },
                },
                take: 50,
            });

            return challenges;
        }),

    // --------------------------------------------------------------------------
    // LIST MY CHALLENGES (Protected - Employer Only)
    // --------------------------------------------------------------------------
    listMyChallenges: protectedProcedure
        .query(async ({ ctx }) => {
            if (ctx.session.user.role !== UserRole.EMPLOYER && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only employers can view their challenges" });
            }

            const challenges = await ctx.db.challenge.findMany({
                where: { employerId: ctx.session.user.id },
                orderBy: { createdAt: 'desc' },
                include: {
                    tasks: true,
                    job: { select: { title: true } },
                    _count: { select: { submissions: true } },
                },
            });

            return challenges;
        }),

    // --------------------------------------------------------------------------
    // UPDATE CHALLENGE (Protected - Employer Only)
    // --------------------------------------------------------------------------
    update: protectedProcedure
        .input(updateChallengeSchema)
        .mutation(async ({ ctx, input }) => {
            const challenge = await ctx.db.challenge.findUnique({
                where: { id: input.id },
                include: { tasks: true },
            });

            if (!challenge) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });

            // Must be the owner OR Admin
            if (challenge.employerId !== ctx.session.user.id && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to edit this challenge" });
            }

            // Cannot update if already has submissions (to prevent cheating)
            const submissionCount = await ctx.db.submission.count({
                where: { challengeId: input.id },
            });

            if (submissionCount > 0) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Cannot edit challenge after submissions have been made",
                });
            }

            // Delete old tasks and create new ones
            await ctx.db.task.deleteMany({ where: { challengeId: input.id } });

            return ctx.db.challenge.update({
                where: { id: input.id },
                data: {
                    title: input.title,
                    description: input.description,
                    type: input.type,
                    jobId: input.jobId,
                    timeLimit: input.timeLimit,
                    tasks: {
                        create: input.tasks.map((task, index) => ({
                            title: task.title,
                            description: task.description,
                            rubric: task.rubric,
                            order: index,
                        })),
                    },
                },
                include: { tasks: true },
            });
        }),

    // --------------------------------------------------------------------------
    // PUBLISH/UNPUBLISH CHALLENGE (Protected - Employer Only)
    // --------------------------------------------------------------------------
    publish: protectedProcedure
        .input(z.object({ id: z.string(), isPublished: z.boolean() }))
        .mutation(async ({ ctx, input }) => {
            const challenge = await ctx.db.challenge.findUnique({
                where: { id: input.id },
            });

            if (!challenge) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });

            if (challenge.employerId !== ctx.session.user.id && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
            }

            return ctx.db.challenge.update({
                where: { id: input.id },
                data: { isPublished: input.isPublished },
            });
        }),

    // --------------------------------------------------------------------------
    // DELETE CHALLENGE (Protected - Employer Only)
    // --------------------------------------------------------------------------
    delete: protectedProcedure
        .input(byIdSchema)
        .mutation(async ({ ctx, input }) => {
            const challenge = await ctx.db.challenge.findUnique({
                where: { id: input.id },
                include: { _count: { select: { submissions: true } } },
            });

            if (!challenge) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });

            if (challenge.employerId !== ctx.session.user.id && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this challenge" });
            }

            if (challenge._count.submissions > 0) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Cannot delete challenge with existing submissions",
                });
            }

            await ctx.db.challenge.delete({ where: { id: input.id } });
            return { success: true };
        }),
});
