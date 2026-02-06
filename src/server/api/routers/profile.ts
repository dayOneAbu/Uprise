import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

// Validation schema for profile updates
const profileSchema = z.object({
    bio: z.string().max(500).optional(),
    skills: z.string().max(1000).optional(), // Comma-separated skills
    location: z.string().max(100).optional(),
    portfolioUrl: z.string().url().optional().or(z.literal("")),
});

export const profileRouter = createTRPCRouter({
    // --------------------------------------------------------------------------
    // GET PROFILE (Public)
    // Get profile by user ID
    // --------------------------------------------------------------------------
    get: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            const profile = await ctx.db.profile.findUnique({
                where: { userId: input.userId },
                include: { user: true }, // Include basic user info
            });

            return profile;
        }),

    // --------------------------------------------------------------------------
    // UPDATE PROFILE (Protected)
    // Update extended profile (bio, skills, location, portfolio)
    // --------------------------------------------------------------------------
    update: protectedProcedure
        .input(profileSchema)
        .mutation(async ({ ctx, input }) => {
            // Upsert profile - create if doesn't exist, update if it does
            const profile = await ctx.db.profile.upsert({
                where: { userId: ctx.session.user.id },
                create: {
                    userId: ctx.session.user.id,
                    bio: input.bio,
                    skills: input.skills ?? "",
                    location: input.location,
                    portfolioUrl: input.portfolioUrl ?? null,
                },
                update: {
                    bio: input.bio,
                    skills: input.skills ?? "",
                    location: input.location,
                    portfolioUrl: input.portfolioUrl ?? null,
                },
            });

            return profile;
        }),
});
