import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole } from "../../../../generated/prisma";

import { applySchema, updateApplicationStatusSchema, byJobIdSchema } from "~/lib/schemas";

// --------------------------------------------------------------------------
// APPLY TO JOB (Protected - Candidate Only)
// --------------------------------------------------------------------------
export const applicationRouter = createTRPCRouter({
    submit: protectedProcedure
        .input(applySchema)
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.user.role !== UserRole.CANDIDATE) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only candidates can apply" });
            }

            // Check if already applied
            const existing = await ctx.db.application.findUnique({
                where: {
                    candidateId_jobId: {
                        candidateId: ctx.session.user.id,
                        jobId: input.jobId,
                    }
                }
            });

            if (existing) {
                throw new TRPCError({ code: "CONFLICT", message: "Already applied to this job" });
            }

            // Get job details for AI grading
            const job = await ctx.db.job.findUnique({
                where: { id: input.jobId },
                select: { testPrompt: true, gradingRubric: true }
            });

            if (!job) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
            }

            // Create application
            const application = await ctx.db.application.create({
                data: {
                    jobId: input.jobId,
                    candidateId: ctx.session.user.id,
                    answerContent: input.answerContent,
                    status: "SUBMITTED",
                }
            });

            // Trigger AI grading (async - don't wait for it in response)
            // In a real app, this would be done via a job queue
            ctx.db.application.update({
                where: { id: application.id },
                data: {
                    status: "REVIEWING", // AI is processing
                }
            }).then(async () => {
                // Call AI grading
                try {
                    await ctx.db.$executeRaw`SELECT 1`; // Keep connection alive
                    // In a real app: await ai.gradeSubmission(application.id, job.testPrompt, input.answerContent);
                    // For demo, we'll simulate this with a delay
                    setTimeout(async () => {
                        // Mock AI grading result
                        const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
                        await ctx.db.application.update({
                            where: { id: application.id },
                            data: {
                                score: mockScore,
                                status: "REVIEWING", // Ready for employer review
                                gradedAt: new Date(),
                                aiAnalysis: JSON.stringify({
                                    feedback: mockScore > 85 ? "Excellent technical solution with strong problem-solving skills!" :
                                             mockScore > 70 ? "Good work with solid understanding of the requirements." :
                                             "Decent attempt, shows basic understanding but needs more depth.",
                                    strengths: ["Problem understanding", "Code structure"],
                                    weaknesses: ["Could use more comments", "Edge cases not handled"],
                                    isPlagiarized: false,
                                    plagiarismConfidence: 0,
                                })
                            }
                        });
                    }, 2000); // 2 second delay to simulate AI processing
                } catch (error) {
                    console.error("AI grading failed:", error);
                    // Fallback: mark as submitted without grading
                    await ctx.db.application.update({
                        where: { id: application.id },
                        data: { status: "SUBMITTED" }
                    });
                }
            }).catch(console.error);

            return application;
        }),

    // --------------------------------------------------------------------------
    // GET MY APPLICATION STATUS FOR A JOB (Protected - Candidate)
    // --------------------------------------------------------------------------
    getMyApplicationStatus: protectedProcedure
        .input(byJobIdSchema)
        .query(async ({ ctx, input }) => {
            const application = await ctx.db.application.findUnique({
                where: {
                    candidateId_jobId: {
                        candidateId: ctx.session.user.id,
                        jobId: input.jobId,
                    }
                }
            });

            return {
                hasApplied: !!application,
                application,
            };
        }),

    // --------------------------------------------------------------------------
    // LIST MY APPLICATIONS (Protected - Candidate)
    // --------------------------------------------------------------------------
    listMyApplications: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.application.findMany({
                where: { candidateId: ctx.session.user.id },
                include: {
                    job: {
                        include: { company: { select: { name: true } } }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }),

    // --------------------------------------------------------------------------
    // LIST JOB APPLICATIONS (Protected - Employer)
    // --------------------------------------------------------------------------
    listByJob: protectedProcedure
        .input(byJobIdSchema)
        .query(async ({ ctx, input }) => {
            const job = await ctx.db.job.findUnique({ where: { id: input.jobId } });
            if (!job) throw new TRPCError({ code: "NOT_FOUND" });

            // Verify ownership (employerId or company scope?)
            // Usually if you are in the company, you can see apps.
            // Let's check company membership.
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { companyId: true }
            });

            if (user?.companyId !== job.companyId && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view applications for this job" });
            }

            // Blind mode for candidates until advanced stages?
            // For now, return all data, but maybe hide name if blind mode is strict.
            // We'll rely on frontend to hide or `getById` blind logic if we fetch full profiles.
            // Here we include profile/user info.
            return ctx.db.application.findMany({
                where: { jobId: input.jobId },
                include: {
                    candidate: {
                        select: {
                            id: true,
                            name: true,
                            successRate: true,
                            badge: true,
                        }
                    }
                },
                orderBy: { score: 'desc' } // Assuming we might sort by score later
            });
        }),

    // --------------------------------------------------------------------------
    // GET APPLICATION (Protected - Employer/Candidate)
    // --------------------------------------------------------------------------
    get: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const application = await ctx.db.application.findUnique({
                where: { id: input.id },
                include: {
                    job: { include: { company: true } },
                    candidate: { include: { profile: true } }
                }
            });

            if (!application) throw new TRPCError({ code: "NOT_FOUND" });

            // Auth check: Candidate (owner) or Employer (job owner)
            const isCandidate = application.candidateId === ctx.session.user.id;

            // For employer check, we need to verify if user belongs to the job's company
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { companyId: true }
            });

            const isEmployer = user?.companyId === application.job.companyId;
            const isAdmin = ctx.session.user.role === UserRole.ADMIN;

            if (!isCandidate && !isEmployer && !isAdmin) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return application;
        }),

    // --------------------------------------------------------------------------
    // UPDATE STATUS (Protected - Employer)
    // --------------------------------------------------------------------------
    updateStatus: protectedProcedure
        .input(updateApplicationStatusSchema)
        .mutation(async ({ ctx, input }) => {
            const application = await ctx.db.application.findUnique({
                where: { id: input.id },
                include: { job: true }
            });
            if (!application) throw new TRPCError({ code: "NOT_FOUND" });

            // Auth check
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { companyId: true }
            });

            if (user?.companyId !== application.job.companyId && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.db.application.update({
                where: { id: input.id },
                data: { status: input.status }
            });
        }),
});
