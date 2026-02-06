import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole } from "../../../../generated/prisma";

// Validation schema for company
const companySchema = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    logoUrl: z.string().url().optional().or(z.literal("")),
});

export const companyRouter = createTRPCRouter({
    // --------------------------------------------------------------------------
    // CREATE COMPANY (Protected - Employer Only)
    // --------------------------------------------------------------------------
    create: protectedProcedure
        .input(companySchema)
        .mutation(async ({ ctx, input }) => {
            // 1. Verify user is an Employer
            if (ctx.session.user.role !== UserRole.EMPLOYER && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Only employers can create companies",
                });
            }

            // 2. Check if slug exists
            const existing = await ctx.db.company.findUnique({
                where: { slug: input.slug },
            });
            if (existing) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Company with this slug already exists",
                });
            }

            // 3. Create company
            const company = await ctx.db.company.create({
                data: {
                    name: input.name,
                    slug: input.slug,
                    logoUrl: input.logoUrl ?? null,
                    members: {
                        connect: { id: ctx.session.user.id },
                    },
                },
            });

            // 4. Link user to company (if not already linked, though members connect handles relation)
            // We also verify if we need to set `companyId` on user explicitly if it's 1:N or N:M.
            // Schema says User has `companyId`, which implies 1 user -> 1 company (or belongs to 1 company).
            // But `Company` has `members User[]`.
            // Let's ensure the bidirectional link is solid.
            await ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data: { companyId: company.id },
            });

            return company;
        }),

    // --------------------------------------------------------------------------
    // GET COMPANY (Public)
    // --------------------------------------------------------------------------
    get: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const company = await ctx.db.company.findUnique({
                where: { slug: input.slug },
                include: {
                    jobs: {
                        where: { status: "OPEN" },
                        select: { id: true, title: true, status: true },
                    },
                    members: {
                        select: { id: true, name: true, image: true },
                    }
                },
            });

            if (!company) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Company not found",
                });
            }

            return company;
        }),

    // --------------------------------------------------------------------------
    // UPDATE COMPANY (Protected - Member Only)
    // --------------------------------------------------------------------------
    update: protectedProcedure
        .input(companySchema.partial().extend({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Verify membership
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
            });

            if (user?.companyId !== input.id && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You are not a member of this company",
                });
            }

            const company = await ctx.db.company.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    slug: input.slug,
                    logoUrl: input.logoUrl,
                }
            });

            return company;
        }),

    // --------------------------------------------------------------------------
    // LIST COMPANIES (Public)
    // --------------------------------------------------------------------------
    list: publicProcedure
        .input(z.object({
            limit: z.number().min(1).max(50).default(20),
            cursor: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const companies = await ctx.db.company.findMany({
                take: input.limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: { createdAt: 'desc' },
            });

            let nextCursor: string | undefined = undefined;
            if (companies.length > input.limit) {
                const nextItem = companies.pop();
                nextCursor = nextItem?.id;
            }

            return {
                companies,
                nextCursor,
            };
        }),
});
