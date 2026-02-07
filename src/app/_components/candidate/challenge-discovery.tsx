"use client";

import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Clock, ArrowRight, Code, Palette, FileText, Brain, Bug } from "lucide-react";
import Link from "next/link";
import type { ChallengeType } from "../../../../generated/prisma";

const challengeTypeConfig: Record<ChallengeType, { icon: React.ElementType; label: string; color: string }> = {
  CODE: { icon: Code, label: "Code Challenge", color: "bg-blue-100 text-blue-800" },
  DESIGN: { icon: Palette, label: "Design Task", color: "bg-purple-100 text-purple-800" },
  WRITING: { icon: FileText, label: "Writing Assignment", color: "bg-green-100 text-green-800" },
  ANALYTICAL: { icon: Brain, label: "Analytical Problem", color: "bg-orange-100 text-orange-800" },
  DEBUGGING: { icon: Bug, label: "Debug Exercise", color: "bg-red-100 text-red-800" },
};

export function ChallengeDiscovery() {
  const { data: challenges, isLoading } = api.challenge.list.useQuery();
  const { data: mySubmissions } = api.submission.listMySubmissions.useQuery();

  const submittedChallengeIds = new Set(mySubmissions?.map(s => s.challengeId) ?? []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-48" />
          </Card>
        ))}
      </div>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Code className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No challenges available</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Check back soon! New skill challenges will be posted here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {challenges.map((challenge) => {
        const config = challengeTypeConfig[challenge.type];
        const Icon = config.icon;
        const isSubmitted = submittedChallengeIds.has(challenge.id);

        return (
          <Card key={challenge.id} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {isSubmitted && (
                  <Badge variant="outline" className="text-xs">Completed</Badge>
                )}
              </div>
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <Badge className={config.color}>{config.label}</Badge>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                {challenge.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {challenge.timeLimit ? `${challenge.timeLimit} min` : "No time limit"}
                </span>
                <span>{challenge._count?.submissions ?? 0} attempts</span>
              </div>
              <Button
                asChild
                variant={isSubmitted ? "outline" : "default"}
                className="w-full gap-2"
              >
                <Link href={`/candidate/challenges/${challenge.id}`}>
                  {isSubmitted ? "View Submission" : "Start Challenge"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
