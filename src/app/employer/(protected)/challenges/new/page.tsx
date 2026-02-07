import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChallengeCreateForm } from "~/app/_components/employer/challenge-create-form";

export default async function NewChallengePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/employer/auth/login");
  }

  if (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Create Challenge</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Design a skill-based assessment. AI will grade submissions instantly.
        </p>
      </div>

      <ChallengeCreateForm />
    </div>
  );
}
