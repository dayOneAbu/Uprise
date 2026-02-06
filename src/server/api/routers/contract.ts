import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserRole } from "../../../../generated/prisma";

import { createContractSchema, byIdSchema } from "~/lib/schemas";

export const contractRouter = createTRPCRouter({
    // --------------------------------------------------------------------------
    // CREATE CONTRACT (Protected - Employer)
    // Created when an application is accepted or manually
    // --------------------------------------------------------------------------
    create: protectedProcedure
        .input(createContractSchema)
        .mutation(async ({ ctx, input }) => {
            // 1. Get Application
            const application = await ctx.db.application.findUnique({
                where: { id: input.applicationId },
                include: { job: true }
            });

            if (!application) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });

            // 2. Verify Auth (Employer who owns the job)
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { companyId: true }
            });

            if (user?.companyId !== application.job.companyId && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            // 3. Create Contract
            // We link intern (candidate) and job.
            return ctx.db.contract.create({
                data: {
                    internId: application.candidateId,
                    jobId: application.jobId,
                    status: "ACTIVE",
                    startDate: input.startDate ?? new Date(),
                    endDate: input.endDate,
                }
            });
        }),

    // --------------------------------------------------------------------------
    // LIST MY CONTRACTS (Protected - Intern or Employer)
    // --------------------------------------------------------------------------
    listMyContracts: protectedProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                include: { company: true }
            });

            if (!user) throw new TRPCError({ code: "NOT_FOUND" });

            if (user.role === UserRole.CANDIDATE) {
                // Intern sees their contracts
                return ctx.db.contract.findMany({
                    where: { internId: user.id },
                    include: { job: { include: { company: true } } },
                    orderBy: { startDate: 'desc' }
                });
            } else if (user.role === UserRole.EMPLOYER) {
                // Employer sees contracts for their company jobs
                if (!user.companyId) return [];
                return ctx.db.contract.findMany({
                    where: { job: { companyId: user.companyId } },
                    include: { intern: true, job: true },
                    orderBy: { startDate: 'desc' }
                });
            }

            return [];
        }),

    // --------------------------------------------------------------------------
    // END CONTRACT (Protected - Employer)
    // --------------------------------------------------------------------------
    endContract: protectedProcedure
        .input(byIdSchema)
        .mutation(async ({ ctx, input }) => {
            const contract = await ctx.db.contract.findUnique({
                where: { id: input.id },
                include: { job: true }
            });
            if (!contract) throw new TRPCError({ code: "NOT_FOUND" });

            // Auth check
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { companyId: true }
            });

            if (user?.companyId !== contract.job.companyId && ctx.session.user.role !== UserRole.ADMIN) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return ctx.db.contract.update({
                where: { id: input.id },
                data: { status: "COMPLETED", endDate: new Date() }
            });
        }),
});
