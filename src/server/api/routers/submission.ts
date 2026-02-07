import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole, SubmissionStatus } from "../../../../generated/prisma";

const submitChallengeSchema = z.object({
    challengeId: z.string(),
    taskResponses: z.array(z.object({
        taskId: z.string(),
        response: z.string(),
    })),
});

const gradeSubmissionSchema = z.object({
    submissionId: z.string(),
    overallScore: z.number().min(0).max(100),
    skills: z.array(z.string()),
    feedback: z.string(),
    plagiarism: z.boolean().default(false),
});

const byIdSchema = z.object({ id: z.string() });

export const submissionRouter = createTRPCRouter({
    // --------------------------------------------------------------------------
    // SUBMIT CHALLENGE (Protected - Candidate Only)
    // --------------------------------------------------------------------------
    submit: protectedProcedure
        .input(submitChallengeSchema)
        .mutation(async ({ ctx, input }) => {
            // 1. Verify candidate role
            if (ctx.session.user.role !== UserRole.CANDIDATE && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only candidates can submit challenges" });
            }

            // 2. Verify challenge exists and is published
            const challenge = await ctx.db.challenge.findUnique({
                where: { id: input.challengeId, isPublished: true },
                include: { tasks: true },
            });

            if (!challenge) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found or not published" });
            }

            // 3. Check if already submitted (prevent duplicate)
            const existingSubmission = await ctx.db.submission.findUnique({
                where: {
                    candidateId_challengeId: {
                        candidateId: ctx.session.user.id,
                        challengeId: input.challengeId,
                    },
                },
            });

            if (existingSubmission) {
                throw new TRPCError({ code: "CONFLICT", message: "You have already submitted this challenge" });
            }

            // 4. Validate all tasks are answered
            const taskIds = challenge.tasks.map(t => t.id);
            const responseTaskIds = input.taskResponses.map(r => r.taskId);
            const missingTasks = taskIds.filter(id => !responseTaskIds.includes(id));

            if (missingTasks.length > 0) {
                throw new TRPCError({ code: "BAD_REQUEST", message: `Missing responses for tasks: ${missingTasks.join(", ")}` });
            }

            // 5. Create submission with task responses
            const submission = await ctx.db.submission.create({
                data: {
                    challengeId: input.challengeId,
                    candidateId: ctx.session.user.id,
                    status: SubmissionStatus.PENDING,
                    taskResponses: {
                        create: input.taskResponses.map(tr => ({
                            taskId: tr.taskId,
                            response: tr.response,
                        })),
                    },
                },
                include: {
                    challenge: true,
                    taskResponses: { include: { task: true } },
                },
            });

            return submission;
        }),

    // --------------------------------------------------------------------------
    // GET MY SUBMISSIONS (Protected - Candidate Only)
    // --------------------------------------------------------------------------
    listMySubmissions: protectedProcedure
        .query(async ({ ctx }) => {
            if (ctx.session.user.role !== UserRole.CANDIDATE && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only candidates can view their submissions" });
            }

            const submissions = await ctx.db.submission.findMany({
                where: { candidateId: ctx.session.user.id },
                orderBy: { createdAt: 'desc' },
                include: {
                    challenge: {
                        include: {
                            employer: { select: { name: true } },
                            job: { select: { title: true } },
                        },
                    },
                    taskResponses: { include: { task: true } },
                },
            });

            return submissions;
        }),

    // --------------------------------------------------------------------------
    // GET SUBMISSION DETAILS (Protected - Owner or Challenge Owner)
    // --------------------------------------------------------------------------
    get: protectedProcedure
        .input(byIdSchema)
        .query(async ({ ctx, input }) => {
            const submission = await ctx.db.submission.findUnique({
                where: { id: input.id },
                include: {
                    challenge: {
                        include: {
                            employer: { select: { id: true, name: true } },
                            job: { select: { title: true } },
                            tasks: true,
                        },
                    },
                    candidate: {
                        select: { id: true, name: true, image: true },
                    },
                    taskResponses: { include: { task: true } },
                },
            });

            if (!submission) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
            }

            // Only candidate who submitted, challenge owner, or admin can view
            const isOwner = submission.candidateId === ctx.session.user.id;
            const isChallengeOwner = submission.challenge?.employerId === ctx.session.user.id;
            const isAdmin = ctx.session.user.role === UserRole.ADMIN;

            if (!isOwner && !isChallengeOwner && !isAdmin) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this submission" });
            }

            return submission;
        }),

    // --------------------------------------------------------------------------
    // GRADE SUBMISSION (Protected - Employer/Admin Only)
    // --------------------------------------------------------------------------
    grade: protectedProcedure
        .input(gradeSubmissionSchema)
        .mutation(async ({ ctx, input }) => {
            // 1. Verify employer or admin role
            if (ctx.session.user.role !== UserRole.EMPLOYER && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only employers can grade submissions" });
            }

            // 2. Get submission with challenge
            const submission = await ctx.db.submission.findUnique({
                where: { id: input.submissionId },
                include: { challenge: true },
            });

            if (!submission) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
            }

            // 3. Verify challenge ownership
            if (submission.challenge?.employerId !== ctx.session.user.id && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to grade this submission" });
            }

            // 4. Update submission with grade
            const updatedSubmission = await ctx.db.submission.update({
                where: { id: input.submissionId },
                data: {
                    status: input.plagiarism ? SubmissionStatus.FLAGGED : SubmissionStatus.COMPLETED,
                    overallScore: input.overallScore,
                    skills: JSON.stringify(input.skills),
                    feedback: input.feedback,
                    plagiarism: input.plagiarism,
                    gradedAt: new Date(),
                },
            });

            // 5. Update or create SkillScores for candidate
            for (const skill of input.skills) {
                const existingScore = await ctx.db.skillScore.findUnique({
                    where: {
                        candidateId_skill: {
                            candidateId: submission.candidateId,
                            skill,
                        },
                    },
                });

                if (existingScore) {
                    // Update with rolling average
                    const newSubmissions = existingScore.submissions + 1;
                    const newScore = Math.round(
                        (existingScore.score * existingScore.submissions + input.overallScore) / newSubmissions
                    );
                    await ctx.db.skillScore.update({
                        where: { id: existingScore.id },
                        data: {
                            score: newScore,
                            submissions: newSubmissions,
                        },
                    });
                } else {
                    await ctx.db.skillScore.create({
                        data: {
                            candidateId: submission.candidateId,
                            skill,
                            score: input.overallScore,
                            submissions: 1,
                        },
                    });
                }
            }

            return updatedSubmission;
        }),

    // --------------------------------------------------------------------------
    // LIST SUBMISSIONS FOR CHALLENGE (Protected - Challenge Owner)
    // --------------------------------------------------------------------------
    listByChallenge: protectedProcedure
        .input(z.object({ challengeId: z.string() }))
        .query(async ({ ctx, input }) => {
            const challenge = await ctx.db.challenge.findUnique({
                where: { id: input.challengeId },
                select: { employerId: true },
            });

            if (!challenge) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
            }

            if (challenge.employerId !== ctx.session.user.id && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to view these submissions" });
            }

            const submissions = await ctx.db.submission.findMany({
                where: { challengeId: input.challengeId },
                orderBy: { createdAt: 'desc' },
                include: {
                    candidate: {
                        select: { id: true, name: true, image: true },
                    },
                    taskResponses: { include: { task: true } },
                },
            });

            return submissions;
        }),

    // --------------------------------------------------------------------------
    // GET CANDIDATE SKILL SCORES (Public - for blind profile browsing)
    // --------------------------------------------------------------------------
    getCandidateSkillScores: publicProcedure
        .input(z.object({ candidateId: z.string() }))
        .query(async ({ ctx, input }) => {
            const skillScores = await ctx.db.skillScore.findMany({
                where: { candidateId: input.candidateId },
                orderBy: { score: 'desc' },
            });

            // Also get submission count and avg score
            const submissions = await ctx.db.submission.findMany({
                where: {
                    candidateId: input.candidateId,
                    status: SubmissionStatus.COMPLETED,
                },
                select: { overallScore: true },
            });

            const completedSubmissions = submissions.filter(s => s.overallScore !== null);
            const avgScore = completedSubmissions.length > 0
                ? Math.round(completedSubmissions.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / completedSubmissions.length)
                : 0;

            return {
                skillScores,
                totalSubmissions: submissions.length,
                completedSubmissions: completedSubmissions.length,
                averageScore: avgScore,
            };
        }),

    // --------------------------------------------------------------------------
    // GET RECENT SUBMISSIONS (Protected - Employer Only)
    // For live activity feed on dashboard
    // --------------------------------------------------------------------------
    getRecent: protectedProcedure
        .input(z.object({ limit: z.number().default(10) }))
        .query(async ({ ctx, input }) => {
            if (ctx.session.user.role !== UserRole.EMPLOYER && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Only employers can view activity feed" });
            }

            // Find challenges created by this employer
            const submissions = await ctx.db.submission.findMany({
                where: {
                    challenge: {
                        employerId: ctx.session.user.id
                    }
                },
                take: input.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    candidate: { select: { name: true, image: true, id: true } },
                    challenge: { select: { title: true } }
                }
            });

            return submissions;
        }),
});
