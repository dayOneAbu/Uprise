import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BlindTalentPool } from "~/app/_components/employer/blind-talent-pool";
import { Button } from "~/app/_components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";

export default async function TalentPoolPage() {
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/employer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Users className="h-8 w-8" />
            Blind Talent Pool
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Browse candidates by proven skills and challenge scores. Identity is hidden until you choose to reveal it—eliminating unconscious bias in early screening.
          </p>
        </div>
      </div>

      <BlindTalentPool />
    </div>
  );
}
