import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChallengeList } from "~/app/_components/employer/challenge-list";
import { Button } from "~/app/_components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function EmployerChallengesPage() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Skill Challenges</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Create AI-graded challenges to evaluate candidates based on proven ability.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/employer/challenges/new">
            <Plus className="h-4 w-4" />
            Create Challenge
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <ChallengeList />
      </div>
    </div>
  );
}
