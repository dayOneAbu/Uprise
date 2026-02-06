import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const profileSchema = z.object({
    bio: z.string().max(500).optional(),
    skills: z.string().max(1000).optional(), // Comma-separated skills
    location: z.string().max(100).optional(),
    portfolioUrl: z.string().url().optional().or(z.literal("")),
});

const updateUserSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    image: z.string().url().optional().or(z.literal("")),
});

// ============================================================================
// USER ROUTER
// ============================================================================

export const userRouter = createTRPCRouter({
    // --------------------------------------------------------------------------
    // GET CURRENT USER (Protected)
    // Returns the authenticated user's full profile
    // --------------------------------------------------------------------------
    me: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.db.user.findUnique({
            where: { id: ctx.session.user.id },
            include: {
                profile: true,
                company: true,
            },
        });

        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            });
        }

        return user;
    }),

    // --------------------------------------------------------------------------
    // GET USER BY ID (Public - Blind Mode)
    // Returns limited info for blind recruitment (no name/image until hired)
    // --------------------------------------------------------------------------
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: input.id },
                include: {
                    profile: true,
                },
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            // Check if requester is the user themselves or has permission
            const isOwner = ctx.session?.user?.id === user.id;
            const isEmployer = ctx.session?.user?.role === "EMPLOYER";
            const isAdmin = ctx.session?.user?.role === "ADMIN";

            // Blind mode: hide personal info unless owner/admin
            if (!isOwner && !isAdmin) {
                return {
                    id: user.id,
                    role: user.role,
                    successRate: user.successRate,
                    badge: user.badge,
                    createdAt: user.createdAt,
                    profile: user.profile
                        ? {
                            bio: user.profile.bio,
                            skills: user.profile.skills,
                            location: user.profile.location,
                            portfolioUrl: user.profile.portfolioUrl,
                        }
                        : null,
                    // Hide these in blind mode
                    name: isEmployer ? null : user.name,
                    image: isEmployer ? null : user.image,
                    email: null,
                };
            }

            return user;
        }),

    // --------------------------------------------------------------------------
    // UPDATE USER (Protected)
    // Update basic user info (name, image)
    // --------------------------------------------------------------------------
    update: protectedProcedure
        .input(updateUserSchema)
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data: {
                    name: input.name,
                    image: input.image ?? null,
                },
            });

            return user;
        }),

    // --------------------------------------------------------------------------
    // UPDATE PROFILE (Protected)
    // Update extended profile (bio, skills, location, portfolio)
    // --------------------------------------------------------------------------
    updateProfile: protectedProcedure
        .input(profileSchema)
        .mutation(async ({ ctx, input }) => {
            // Upsert profile - create if doesn't exist, update if it does
            const profile = await ctx.db.profile.upsert({
                where: { userId: ctx.session.user.id },
                create: {
                    userId: ctx.session.user.id,
                    bio: input.bio,
                    skills: input.skills,
                    location: input.location,
                    portfolioUrl: input.portfolioUrl ?? null,
                },
                update: {
                    bio: input.bio,
                    skills: input.skills,
                    location: input.location,
                    portfolioUrl: input.portfolioUrl ?? null,
                },
            });

            return profile;
        }),

    // --------------------------------------------------------------------------
    // LIST CANDIDATES (Employer only)
    // Browse candidates by reputation for hiring
    // --------------------------------------------------------------------------
    listCandidates: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(20),
                cursor: z.string().optional(), // For pagination
                minSuccessRate: z.number().min(0).max(100).optional(),
                badge: z.enum(["NONE", "RISING_TALENT", "TOP_RATED", "EXPERT"]).optional(),
                skills: z.string().optional(), // Search in skills
            })
        )
        .query(async ({ ctx, input }) => {
            // Only employers and admins can browse candidates
            if (ctx.session.user.role !== "EMPLOYER" && ctx.session.user.role !== "ADMIN") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only employers can browse candidates",
                });
            }

            const candidates = await ctx.db.user.findMany({
                where: {
                    role: "CANDIDATE",
                    successRate: input.minSuccessRate
                        ? { gte: input.minSuccessRate }
                        : undefined,
                    badge: input.badge,
                    profile: input.skills
                        ? {
                            skills: {
                                contains: input.skills,
                            },
                        }
                        : undefined,
                },
                include: {
                    profile: true,
                },
                orderBy: {
                    successRate: "desc",
                },
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
            });

            let nextCursor: string | undefined = undefined;
            if (candidates.length > input.limit) {
                const nextItem = candidates.pop();
                nextCursor = nextItem?.id;
            }

            // Return blind data (no names/images)
            const blindCandidates = candidates.map((c) => ({
                id: c.id,
                successRate: c.successRate,
                badge: c.badge,
                totalEarnings: c.totalEarnings,
                createdAt: c.createdAt,
                profile: c.profile
                    ? {
                        bio: c.profile.bio,
                        skills: c.profile.skills,
                        location: c.profile.location,
                        portfolioUrl: c.profile.portfolioUrl,
                    }
                    : null,
            }));

            return {
                candidates: blindCandidates,
                nextCursor,
            };
        }),

    // --------------------------------------------------------------------------
    // DELETE ACCOUNT (Protected)
    // Soft delete - just mark as inactive (we keep data for audit)
    // --------------------------------------------------------------------------
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
        // In a real app, you'd soft delete. For hackathon, we'll actually delete.
        await ctx.db.user.delete({
            where: { id: ctx.session.user.id },
        });

        return { success: true };
    }),

    // --------------------------------------------------------------------------
    // GET USER STATS (Protected)
    // Get user's reputation stats
    // --------------------------------------------------------------------------
    getStats: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        const [user, contractCount, applicationCount, reviewCount] =
            await Promise.all([
                ctx.db.user.findUnique({
                    where: { id: userId },
                    select: {
                        successRate: true,
                        badge: true,
                        totalEarnings: true,
                    },
                }),
                ctx.db.contract.count({
                    where: { internId: userId },
                }),
                ctx.db.application.count({
                    where: { candidateId: userId },
                }),
                ctx.db.review.count({
                    where: { revieweeId: userId },
                }),
            ]);

        if (!user) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            });
        }

        return {
            successRate: user.successRate,
            badge: user.badge,
            totalEarnings: user.totalEarnings,
            totalContracts: contractCount,
            totalApplications: applicationCount,
            totalReviews: reviewCount,
        };
    }),
});
