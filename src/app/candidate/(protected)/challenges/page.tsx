import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChallengeDiscovery } from "~/app/_components/candidate/challenge-discovery";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent } from "~/app/_components/ui/card";
import { Award, Target, Zap } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/server";

export default async function CandidateChallengesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/candidate/auth/login");
  }

  // Get candidate skill scores
  const skillScores = await api.submission.getCandidateSkillScores({ 
    candidateId: session.user.id 
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Skill Sprints</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Prove your abilities with real-world challenges. Your scores become your credentials.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{skillScores.totalSubmissions}</div>
              <div className="text-sm text-muted-foreground">Challenges Taken</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{skillScores.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">{skillScores.skillScores.length}</div>
              <div className="text-sm text-muted-foreground">Skills Verified</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Skills */}
      {skillScores.skillScores.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Verified Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skillScores.skillScores.slice(0, 8).map((skill) => (
              <div 
                key={skill.id} 
                className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full"
              >
                <span className="font-medium">{skill.skill}</span>
                <span className="text-sm text-muted-foreground">{skill.score}/100</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Challenges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Available Challenges</h2>
          <Button variant="outline" asChild>
            <Link href="/candidate">Back to Dashboard</Link>
          </Button>
        </div>
        <ChallengeDiscovery />
      </div>
    </div>
  );
}
