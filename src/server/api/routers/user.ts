import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
    adminProcedure,
} from "~/server/api/trpc";
import { UserRole } from "~/generated/prisma";




import {
    updateUserSchema,
    setRoleSchema,
    adminListUsersSchema,
    listCandidatesSchema
} from "~/lib/schemas";

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
            const isEmployer = ctx.session?.user?.role === UserRole.EMPLOYER;
            const isAdmin = ctx.session?.user?.role === UserRole.ADMIN;


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
    // SET ROLE (Protected - One Time)
    // Allows new users to set their role to CANDIDATE or EMPLOYER
    // --------------------------------------------------------------------------
    setRole: protectedProcedure
        .input(setRoleSchema)
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            // Only allow setting role if currently UNASSIGNED
            if (user.role !== UserRole.UNASSIGNED) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Role has already been assigned.",
                });
            }

            return ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data: { role: input.role },
            });
        }),

    // --------------------------------------------------------------------------
    // ADMIN LIST USERS (Admin Only)
    // --------------------------------------------------------------------------
    adminListUsers: adminProcedure
        .input(adminListUsersSchema)
        .query(async ({ ctx, input }) => {
            // ...
            // Logic remains same, schema handles defaults
            const limit = input.limit ?? 50; // Fallback if schema default fails or manual override needed
            const users = await ctx.db.user.findMany({
                where: {
                    role: input.role,
                    OR: input.search ? [
                        { name: { contains: input.search } },
                        { email: { contains: input.search } }
                    ] : undefined,
                },
                take: limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: { createdAt: 'desc' },
            });

            let nextCursor: string | undefined = undefined;
            if (users.length > limit) {
                const nextItem = users.pop();
                nextCursor = nextItem?.id;
            }

            return {
                users,
                nextCursor,
            };
        }),


    // --------------------------------------------------------------------------
    // LIST CANDIDATES (Employer only)
    // Browse candidates by reputation for hiring
    // --------------------------------------------------------------------------
    listCandidates: protectedProcedure
        .input(listCandidatesSchema)
        .query(async ({ ctx, input }) => {
            // Only employers and admins can browse candidates
            if (ctx.session.user.role !== UserRole.EMPLOYER && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only employers can browse candidates",
                });
            }

            const candidates = await ctx.db.user.findMany({
                where: {
                    role: UserRole.CANDIDATE,
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
