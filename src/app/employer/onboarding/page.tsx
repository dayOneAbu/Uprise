import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EmployerWizard } from "~/app/_components/onboarding/employer-wizard";

export default async function EmployerOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/employer/auth/login");
  }

  // Double check if already has company to prevent re-onboarding loop or duplicate creation
  // Ideally this check sits in layout or middleware, but good as safety
  if (session.user.companyId) {
      redirect("/employer/jobs");
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create your Company Profile</h1>
        <p className="text-slate-500 mt-2">Start hiring top talent by setting up your organization.</p>
      </div>
      <EmployerWizard />
    </div>
  );
}
