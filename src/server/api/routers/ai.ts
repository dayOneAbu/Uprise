/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole } from "../../../../generated/prisma";
import { matchCandidateToJob, batchMatchCandidates, gradeSubmissionWithAI } from "~/lib/ai-service";

export const aiRouter = createTRPCRouter({
    // --------------------------------------------------------------------------
    // GET TOP MATCHED CANDIDATES FOR EMPLOYER (Shows top talent)
    // --------------------------------------------------------------------------
    getTopCandidates: protectedProcedure
        .input(z.object({
            companyId: z.string(),
            limit: z.number().default(10),
            aiProvider: z.enum(['openai', 'anthropic', 'google', 'grok']).default('openai')
        }))
        .query(async ({ ctx, input }) => {
            // Get all candidates with their profiles
            const candidates = await ctx.db.user.findMany({
                where: {
                    role: UserRole.CANDIDATE,
                    profile: { isNot: null }
                },
                include: {
                    profile: true,
                    skillScores: true,
                },
                take: 50, // Limit for AI processing
            });

            // Get company's open jobs
            const jobs = await ctx.db.job.findMany({
                where: {
                    companyId: input.companyId,
                    status: "OPEN"
                }
            });

            if (jobs.length === 0) {
                return [];
            }

            // Use AI to match candidates against all company jobs
            const candidateData = candidates.map(c => ({
                id: c.id,
                skills: c.profile?.skills ?? '',
                experienceLevel: c.successRate > 80 ? "advanced" :
                    c.successRate > 60 ? "intermediate" : "beginner",
                jss: c.successRate,
                bio: c.profile?.bio ?? ''
            }));

            const jobData = jobs[0]; // Focus on best job for demo, could expand to all jobs


            if (!jobData) return [];

            // Get AI-powered matches
            const matches = await batchMatchCandidates(candidateData, {
                title: jobData.title,
                skills: jobData.skillsRequired ?? '',
                experienceLevel: jobData.experienceLevel ?? 'intermediate',
                locationType: jobData.locationType ?? 'remote',
                duration: jobData.duration ?? undefined,
                isPaid: jobData.isPaid,
                description: jobData.description ?? ''
            }, input.aiProvider);

            // Format response for frontend
            return matches
                .filter(match => match.score > 60) // Only show good matches
                .sort((a, b) => b.score - a.score)
                .slice(0, input.limit)
                .map(match => {
                    const candidate = candidates.find(c => c.id === match.candidateId)!;
                    return {
                        candidate: {
                            id: candidate.id,
                            name: candidate.name,
                            email: candidate.email,
                            successRate: candidate.successRate,
                            badge: candidate.badge,
                            profile: candidate.profile,
                            skillScores: (candidate as any).skillScores,
                            createdAt: candidate.createdAt
                        },
                        matchScore: match.score,
                        reasoning: match.reasoning,
                        strengths: match.strengths,
                        gaps: match.gaps,
                        recommendations: match.recommendations,
                        aiProvider: match.provider,
                        aiModel: match.model
                    };
                });
        }),

    // --------------------------------------------------------------------------
    // GET MATCHED JOBS FOR CANDIDATE (Personalized recommendations)
    // --------------------------------------------------------------------------
    getMatchedJobs: protectedProcedure
        .input(z.object({
            candidateId: z.string(),
            limit: z.number().default(10),
            aiProvider: z.enum(['openai', 'anthropic', 'google', 'grok']).default('openai')
        }))
        .query(async ({ ctx, input }) => {
            // Get candidate profile
            const candidate = await ctx.db.user.findUnique({
                where: { id: input.candidateId },
                include: { profile: true }
            });

            if (!candidate) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Candidate not found"
                });
            }

            // If no profile exists, return empty matches (user needs to complete onboarding)
            if (!candidate.profile) {
                return [];
            }

            // Get all open jobs
            const jobs = await ctx.db.job.findMany({
                where: { status: "OPEN" },
                include: {
                    company: {
                        select: { name: true, logoUrl: true }
                    }
                },
                take: 20 // Limit for AI processing
            });

            // Prepare candidate data
            const candidateData = {
                skills: candidate.profile?.skills ?? '',
                experienceLevel: candidate.successRate > 80 ? "advanced" :
                    candidate.successRate > 60 ? "intermediate" : "beginner",
                jss: candidate.successRate,
                bio: candidate.profile?.bio ?? ''
            };

            // Use AI to match candidate against all jobs
            const jobMatches = await Promise.all(
                jobs.map(async (job) => {
                    const matchResult = await matchCandidateToJob(candidateData, {
                        title: job.title,
                        skills: job.skillsRequired ?? '',
                        experienceLevel: job.experienceLevel ?? 'intermediate',
                        locationType: job.locationType ?? 'remote',
                        duration: job.duration ?? undefined,
                        isPaid: job.isPaid,
                        description: job.description ?? ''
                    }, input.aiProvider);

                    return {
                        job: {
                            id: job.id,
                            title: job.title,
                            description: job.description,
                            locationType: job.locationType,
                            duration: job.duration,
                            isPaid: job.isPaid,
                            salaryRange: job.salaryRange,
                            skillsRequired: job.skillsRequired,
                            experienceLevel: job.experienceLevel,
                            company: job.company,
                            createdAt: job.createdAt
                        },
                        matchScore: matchResult.score,
                        reasoning: matchResult.reasoning,
                        strengths: matchResult.strengths,
                        gaps: matchResult.gaps,
                        recommendations: matchResult.recommendations,
                        aiProvider: matchResult.provider,
                        aiModel: matchResult.model
                    };
                })
            );

            // Sort by match score and return top matches
            return jobMatches
                .filter(match => match.matchScore > 40) // Show decent matches
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, input.limit);
        }),

    // --------------------------------------------------------------------------
    // GENERATE SKILL RECOMMENDATIONS FOR JOB
    // --------------------------------------------------------------------------
    generateJobSkills: protectedProcedure
        .input(z.object({
            jobTitle: z.string(),
            jobDescription: z.string(),
            aiProvider: z.enum(['openai', 'anthropic', 'google', 'grok']).default('openai')
        }))
        .mutation(async ({ input }) => {
            const prompt = `
Analyze this job posting and suggest the top 5-8 technical skills required.

Job Title: ${input.jobTitle}
Job Description: ${input.jobDescription}

Return a JSON object with this structure:
{
  "skills": ["skill1", "skill2", ...],
  "confidence": number (80-100)
}
`;

            try {
                const { callAIProvider } = await import("~/lib/ai-service");
                const response = await callAIProvider(input.aiProvider, prompt);

                // Parse JSON response
                const jsonRegex = /\{[\s\S]*\}/;
                const jsonMatch = jsonRegex.exec(response);
                if (!jsonMatch) {
                    throw new Error('Invalid JSON response');
                }

                const result = JSON.parse(jsonMatch[0]) as {
                    skills: string[];
                    confidence: number;
                };

                return {
                    suggestedSkills: result.skills?.slice(0, 8) ?? [],
                    confidence: Math.max(80, Math.min(100, result.confidence ?? 90))
                };
            } catch (error) {
                console.error('AI skill generation failed:', error);

                // Fallback: return empty, let user manually enter
                return {
                    suggestedSkills: [],
                    confidence: 0,
                    error: 'AI service unavailable. Please enter skills manually.'
                };
            }
        }),

    // --------------------------------------------------------------------------
    // GRADE SUBMISSION WITH AI
    // --------------------------------------------------------------------------
    gradeSubmission: protectedProcedure
        .input(z.object({
            submissionId: z.string(),
            aiProvider: z.enum(['openai', 'anthropic', 'google', 'grok']).default('openai')
        }))
        .mutation(async ({ ctx, input }) => {
            // Get submission with all details
            const submission = await ctx.db.submission.findUnique({
                where: { id: input.submissionId },
                include: {
                    challenge: {
                        include: {
                            tasks: true
                        }
                    },
                    taskResponses: true,
                    candidate: {
                        include: {
                            profile: true
                        }
                    }
                }
            });

            if (!submission) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
            }

            // Verify employer owns the challenge
            if (submission.challenge.employerId !== ctx.session.user.id && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to grade this submission" });
            }

            // Update status to grading
            await ctx.db.submission.update({
                where: { id: input.submissionId },
                data: { status: "GRADING" }
            });

            // Real AI grading using database records
            const taskResponsesWithDetails = submission.taskResponses.map((tr: { taskId: string; response: string }) => {
                const task = submission.challenge.tasks.find((t: { id: string }) => t.id === tr.taskId);
                return {
                    taskTitle: task?.title ?? "Task",
                    taskDescription: task?.description ?? "",
                    response: tr.response
                };
            });

            // Call real AI grading service
            const gradingResult = await gradeSubmissionWithAI(
                {
                    title: submission.challenge.title,
                    type: submission.challenge.type,
                    description: submission.challenge.description
                },
                taskResponsesWithDetails,
                input.aiProvider
            );

            // Update submission with real grades
            await ctx.db.submission.update({
                where: { id: input.submissionId },
                data: {
                    status: gradingResult.plagiarism ? "FLAGGED" : "COMPLETED",
                    overallScore: gradingResult.overallScore,
                    skills: JSON.stringify(gradingResult.skills),
                    feedback: gradingResult.feedback,
                    plagiarism: gradingResult.plagiarism,
                    gradedAt: new Date()
                }
            });

            // Update or create SkillScores for candidate
            for (const skill of gradingResult.skills) {
                const existingScore = await ctx.db.skillScore.findUnique({
                    where: {
                        candidateId_skill: {
                            candidateId: submission.candidateId,
                            skill
                        }
                    }
                });

                if (existingScore) {
                    // Update with rolling average
                    const newSubmissions = existingScore.submissions + 1;
                    const newScore = Math.round(
                        (existingScore.score * existingScore.submissions + gradingResult.overallScore) / newSubmissions
                    );
                    await ctx.db.skillScore.update({
                        where: { id: existingScore.id },
                        data: {
                            score: newScore,
                            submissions: newSubmissions
                        }
                    });
                } else {
                    await ctx.db.skillScore.create({
                        data: {
                            candidateId: submission.candidateId,
                            skill,
                            score: gradingResult.overallScore,
                            submissions: 1
                        }
                    });
                }
            }

            // Return grading result from database
            return {
                submissionId: input.submissionId,
                overallScore: gradingResult.overallScore,
                taskScores: gradingResult.taskScores,
                skills: gradingResult.skills,
                feedback: gradingResult.feedback,
                plagiarism: gradingResult.plagiarism,
                aiProvider: gradingResult.provider,
                model: gradingResult.model,
                timestamp: new Date().toISOString()
            };
        }),
});