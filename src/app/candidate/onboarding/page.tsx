import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CandidateWizard } from "~/app/_components/onboarding/candidate-wizard";

export default async function CandidateOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Complete your profile</h1>
        <p className="text-slate-500 mt-2">Help us match you with the best internships.</p>
      </div>
      <CandidateWizard />
    </div>
  );
}
