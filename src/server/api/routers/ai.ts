import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole } from "../../../../generated/prisma";

// Mock AI grading function - in real app this would call Gemini/Google AI
function mockAIGrading(testPrompt: string, userAnswer: string) {
    // Simulate AI analysis with some randomness but consistent logic
    const answerLength = userAnswer.length;
    const promptWords = testPrompt.split(' ').length;
    const answerWords = userAnswer.split(' ').length;

    // Basic scoring logic
    let score = 50; // Base score

    // Length appropriateness (answers shouldn't be too short or too long)
    if (answerWords < promptWords * 0.5) score -= 20; // Too short
    if (answerWords > promptWords * 3) score -= 10; // Too long

    // Code-like content detection (basic heuristic)
    const hasCodePatterns = /function|class|const|let|var|import|export/.test(userAnswer);
    if (hasCodePatterns && testPrompt.toLowerCase().includes('code')) score += 15;

    // Structure and formatting
    const hasStructure = userAnswer.includes('\n') || userAnswer.includes('- ') || userAnswer.includes('1.');
    if (hasStructure) score += 10;

    // Random variation to simulate AI uncertainty
    score += Math.floor(Math.random() * 20) - 10;

    // Clamp between 0-100
    score = Math.max(0, Math.min(100, score));

    // Mock feedback based on score
    let feedback = "";
    if (score >= 90) {
        feedback = "Excellent solution! Shows deep understanding and strong technical skills.";
    } else if (score >= 75) {
        feedback = "Good work! Solid understanding with room for refinement.";
    } else if (score >= 60) {
        feedback = "Decent attempt. Consider adding more technical depth and examples.";
    } else if (score >= 40) {
        feedback = "Basic understanding shown. Focus on the core requirements.";
    } else {
        feedback = "Needs significant improvement. Review the requirements and try again.";
    }

    // Mock strengths and weaknesses
    const strengths = [];
    const weaknesses = [];

    if (score > 70) strengths.push("Clear problem understanding");
    if (hasStructure) strengths.push("Well-organized response");
    if (hasCodePatterns) strengths.push("Technical implementation");

    if (score < 70) weaknesses.push("Could be more detailed");
    if (!hasStructure) weaknesses.push("Better organization needed");
    if (answerWords < 50) weaknesses.push("More comprehensive answer required");

    // Mock plagiarism detection (very basic)
    const isPlagiarized = Math.random() < 0.05; // 5% chance of flagging
    const plagiarismConfidence = isPlagiarized ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20);

    return {
        score,
        feedback,
        strengths,
        weaknesses,
        isPlagiarized,
        plagiarismConfidence,
        processingTime: Math.floor(Math.random() * 2000) + 1000, // 1-3 seconds
    };
}

export const aiRouter = createTRPCRouter({
    // --------------------------------------------------------------------------
    // GRADE APPLICATION SUBMISSION (Internal - Called by application submission)
    // --------------------------------------------------------------------------
    gradeSubmission: protectedProcedure
        .input(z.object({
            applicationId: z.string(),
            testPrompt: z.string(),
            userAnswer: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            // In a real app, this would:
            // 1. Call Google Gemini AI API
            // 2. Analyze the submission against the rubric
            // 3. Detect plagiarism
            // 4. Store results in database

            const grading = mockAIGrading(input.testPrompt, input.userAnswer);

            // Update the application with AI results
            await ctx.db.application.update({
                where: { id: input.applicationId },
                data: {
                    score: grading.score,
                    aiAnalysis: JSON.stringify({
                        feedback: grading.feedback,
                        strengths: grading.strengths,
                        weaknesses: grading.weaknesses,
                        isPlagiarized: grading.isPlagiarized,
                        plagiarismConfidence: grading.plagiarismConfidence,
                        processingTime: grading.processingTime,
                    }),
                    isAiFlagged: grading.isPlagiarized && grading.plagiarismConfidence > 80,
                    gradedAt: new Date(),
                },
            });

            return grading;
        }),

    // --------------------------------------------------------------------------
    // GENERATE GRADING RUBRIC (Employer Helper)
    // --------------------------------------------------------------------------
    generateRubric: protectedProcedure
        .input(z.object({
            jobDescription: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Mock rubric generation
            const rubric = `Technical Skills (40%):
- Correct implementation of required functionality
- Code quality and best practices
- Understanding of relevant technologies

Problem Solving (30%):
- Approach to breaking down the problem
- Logical thinking and solution design
- Handling edge cases

Communication (20%):
- Clear code comments and documentation
- Well-structured response
- Explanation of solution approach

Creativity (10%):
- Innovative solutions or optimizations
- Going beyond basic requirements`;

            return { rubric };
        }),

    // --------------------------------------------------------------------------
    // DETECT PLAGIARISM (Internal)
    // --------------------------------------------------------------------------
    detectPlagiarism: protectedProcedure
        .input(z.object({
            content: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            // Mock plagiarism detection
            const isPlagiarized = Math.random() < 0.05; // 5% false positive rate
            const confidence = isPlagiarized ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20);

            return {
                isPlagiarized,
                confidence,
                sources: isPlagiarized ? ["stackoverflow.com", "github.com"] : [],
            };
        }),
});