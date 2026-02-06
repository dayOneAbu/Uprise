import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CandidateOnboardingState {
    bio: string;
    location: string;
    skills: string[];
    portfolioUrl: string;
    step: number;
}

interface EmployerOnboardingState {
    name: string;
    slug: string;
    website: string;
    description: string;
    logoUrl: string;
    step: number;
}

interface OnboardingStore {
    candidate: CandidateOnboardingState;
    employer: EmployerOnboardingState;

    setCandidateData: (data: Partial<CandidateOnboardingState>) => void;
    setEmployerData: (data: Partial<EmployerOnboardingState>) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        (set) => ({
            candidate: {
                bio: "",
                location: "",
                skills: [],
                portfolioUrl: "",
                step: 1,
            },
            employer: {
                name: "",
                slug: "",
                website: "",
                description: "",
                logoUrl: "",
                step: 1,
            },
            setCandidateData: (data) => set((state) => ({
                candidate: { ...state.candidate, ...data }
            })),
            setEmployerData: (data) => set((state) => ({
                employer: { ...state.employer, ...data }
            })),
            reset: () => set({
                candidate: {
                    bio: "",
                    location: "",
                    skills: [],
                    portfolioUrl: "",
                    step: 1,
                },
                employer: {
                    name: "",
                    slug: "",
                    website: "",
                    description: "",
                    logoUrl: "",
                    step: 1,
                }
            })
        }),
        {
            name: 'onboarding-storage', // name of the item in the storage (must be unique)
        }
    )
);
