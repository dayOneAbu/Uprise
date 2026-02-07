import { z } from "zod";
import { UserRole, Badge } from "../../generated/prisma";

// ============================================================================
// SHARED
// ============================================================================
export const paginationSchema = z.object({
    limit: z.number().min(1).max(100).default(20),
    cursor: z.string().optional(),
});

export const byIdSchema = z.object({
    id: z.string(),
});

export const bySlugSchema = z.object({
    slug: z.string(),
});

export const byJobIdSchema = z.object({
    jobId: z.string(),
});

// ============================================================================
// USER
// ============================================================================
export const updateUserSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    image: z.string().url().optional().or(z.literal("")),
});

export const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().regex(/^[^@]+@[^@]+\.[^@]+$/, "Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.nativeEnum(UserRole).optional(),
});

export const loginSchema = z.object({
    email: z.string().regex(/^[^@]+@[^@]+\.[^@]+$/, "Invalid email address"),
    password: z.string().min(1, "Password is required"),
});


export const setRoleSchema = z.object({
    role: z.enum([UserRole.CANDIDATE, UserRole.EMPLOYER]),
});

export const adminListUsersSchema = paginationSchema.extend({
    role: z.nativeEnum(UserRole).optional(),
    search: z.string().optional(),
});

export const listCandidatesSchema = paginationSchema.extend({
    minSuccessRate: z.number().min(0).max(100).optional(),
    badge: z.nativeEnum(Badge).optional(),
    skills: z.string().optional(),
});

// ============================================================================
// PROFILE
// ============================================================================
export const profileSchema = z.object({
    bio: z.string().max(500).optional(),
    skills: z.string().max(1000).optional(), // Comma-separated skills
    location: z.string().max(100).optional(),
    portfolioUrl: z.string().url().optional().or(z.literal("")),
});

// ============================================================================
// COMPANY
// ============================================================================
export const companySchema = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    logoUrl: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    description: z.string().min(10).optional().or(z.literal("")),
});

export const updateCompanySchema = companySchema.partial().extend({
    id: z.string(),
});

// ============================================================================
// JOB
// ============================================================================
export const jobSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(20),
    locationType: z.enum(["remote", "onsite", "hybrid"]).optional(),
    duration: z.number().min(1).max(12).optional(), // 1-12 months
    isPaid: z.boolean().default(false),
    salaryRange: z.string().optional(),
    skillsRequired: z.string().optional(),
    experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    companyId: z.string(),
    // Challenge fields (optional - creates challenge with job)
    challengeTitle: z.string().min(3).optional(),
    challengeDescription: z.string().min(10).optional(),
    challengeType: z.enum(["CODE", "DESIGN", "WRITING", "ANALYTICAL", "DEBUGGING"]).optional(),
    challengeTimeLimit: z.number().min(5).max(180).optional(),
    challengeTasks: z.array(z.object({
        title: z.string().min(3),
        description: z.string().min(10),
    })).optional(),
});

export const updateJobSchema = jobSchema.partial().extend({
    id: z.string(),
});

export const listJobsSchema = paginationSchema.extend({
    companyId: z.string().optional(),
    search: z.string().optional(),
});

// ============================================================================
// APPLICATION
// ============================================================================
export const applySchema = z.object({
    jobId: z.string(),
});

export const updateApplicationStatusSchema = z.object({
    id: z.string(),
    status: z.enum(["SUBMITTED", "REVIEWING", "INTERVIEW", "OFFER", "REJECTED", "ACCEPTED"])
});

// ============================================================================
// CONTRACT
// ============================================================================
export const createContractSchema = z.object({
    applicationId: z.string(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
});

// ============================================================================
// REVIEW
// ============================================================================
export const reviewSchema = z.object({
    contractId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    privateScore: z.number().min(1).max(10).optional(), // Internal hidden score
});
