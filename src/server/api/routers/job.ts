import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole } from "../../../../generated/prisma";

import { jobSchema, updateJobSchema, listJobsSchema, byIdSchema } from "~/lib/schemas";

export const jobRouter = createTRPCRouter({
    // --------------------------------------------------------------------------
    // CREATE JOB WITH CHALLENGE (Protected - Employer Only)
    // --------------------------------------------------------------------------
    create: protectedProcedure
        .input(jobSchema)
        .mutation(async ({ ctx, input }) => {
            // 1. Verify access
            if (ctx.session.user.role !== UserRole.EMPLOYER && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only employers can post jobs" });
            }

            // 2. Verify company membership
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { companyId: true },
            });

            if (user?.companyId !== input.companyId && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this company" });
            }

            // 3. Create job and challenge in transaction
            const result = await ctx.db.$transaction(async (tx) => {
                // Create the job
                const job = await tx.job.create({
                    data: {
                        title: input.title,
                        description: input.description,
                        locationType: input.locationType,
                        duration: input.duration,
                        isPaid: input.isPaid,
                        salaryRange: input.salaryRange,
                        skillsRequired: input.skillsRequired,
                        experienceLevel: input.experienceLevel,
                        status: "OPEN",
                        companyId: input.companyId,
                        employerId: ctx.session.user.id,
                    },
                });

                // Create challenge if provided
                let challenge = null;
                if (input.challengeTitle && input.challengeType && input.challengeTasks && input.challengeTasks.length > 0) {
                    challenge = await tx.challenge.create({
                        data: {
                            title: input.challengeTitle,
                            description: input.challengeDescription ?? `Complete this challenge to apply for ${input.title}`,
                            type: input.challengeType,
                            employerId: ctx.session.user.id,
                            jobId: job.id,
                            timeLimit: input.challengeTimeLimit,
                            isPublished: true,
                            tasks: {
                                create: input.challengeTasks.map((task, index) => ({
                                    title: task.title,
                                    description: task.description,
                                    order: index,
                                })),
                            },
                        },
                    });
                }

                return { job, challenge };
            });

            return result;
        }),

    // --------------------------------------------------------------------------
    // GET JOB (Public - includes challenge)
    // --------------------------------------------------------------------------
    get: publicProcedure
        .input(byIdSchema)
        .query(async ({ ctx, input }) => {
            const job = await ctx.db.job.findUnique({
                where: { id: input.id },
                include: {
                    company: { select: { name: true, logoUrl: true, slug: true, description: true } },
                    _count: { select: { applications: true } },
                    challenges: {
                        where: { isPublished: true },
                        include: {
                            tasks: { orderBy: { order: 'asc' } },
                            _count: { select: { submissions: true } },
                        },
                    },
                },
            });

            if (!job) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
            }

            return job;
        }),

    // --------------------------------------------------------------------------
    // LIST JOBS (Public - Search/Filter)
    // --------------------------------------------------------------------------
    list: publicProcedure
        .input(listJobsSchema)
        .query(async ({ ctx, input }) => {
            const where = {
                status: "OPEN",
                companyId: input.companyId,
                OR: input.search ? [
                    { title: { contains: input.search } },
                    { description: { contains: input.search } }
                ] : undefined,
            };

            const jobs = await ctx.db.job.findMany({
                where,
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: { createdAt: 'desc' },
                include: {
                    company: { select: { name: true, logoUrl: true, slug: true } },
                }
            });

            let nextCursor: string | undefined = undefined;
            if (jobs.length > input.limit) {
                const nextItem = jobs.pop();
                nextCursor = nextItem?.id;
            }

            return { jobs, nextCursor };
        }),

    // --------------------------------------------------------------------------
    // UPDATE JOB (Protected - Employer Only)
    // --------------------------------------------------------------------------
    update: protectedProcedure
        .input(updateJobSchema)
        .mutation(async ({ ctx, input }) => {
            const job = await ctx.db.job.findUnique({ where: { id: input.id } });
            if (!job) throw new TRPCError({ code: "NOT_FOUND" });

            // Must be the original poster OR Admin
            if (job.employerId !== ctx.session.user.id && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to edit this job" });
            }

            return ctx.db.job.update({
                where: { id: input.id },
                data: {
                    title: input.title,
                    description: input.description,
                }
            });
        }),
});
