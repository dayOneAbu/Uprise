"use client";

import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Progress } from "~/app/_components/ui/progress";
import { Award, Target, Clock, CheckCircle2, TrendingUp } from "lucide-react";

interface CandidateSkillProfileProps {
  candidateId: string;
}

export function CandidateSkillProfile({ candidateId }: CandidateSkillProfileProps) {
  const { data: skillScores, isLoading } = api.submission.getCandidateSkillScores.useQuery({ candidateId });
  const { data: submissions } = api.submission.listMySubmissions.useQuery();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-64" />
      </Card>
    );
  }

  const completedSubmissions = submissions?.filter(s => s.status === "COMPLETED") ?? [];
  const topSkills = skillScores?.skillScores.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      {/* Skill Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Verified Skills
          </CardTitle>
          <CardDescription>
            Skills demonstrated through completed challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topSkills.length > 0 ? (
            <div className="space-y-4">
              {topSkills.map((skill) => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {skill.submissions} challenge{skill.submissions !== 1 ? 's' : ''}
                      </span>
                      <Badge variant={skill.score >= 80 ? "default" : "secondary"}>
                        {skill.score}/100
                      </Badge>
                    </div>
                  </div>
                  <Progress value={skill.score} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No verified skills yet. Complete challenges to build your profile.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Challenge History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Challenge History
          </CardTitle>
          <CardDescription>
            {completedSubmissions.length} challenge{completedSubmissions.length !== 1 ? 's' : ''} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedSubmissions.length > 0 ? (
            <div className="space-y-3">
              {completedSubmissions.slice(0, 5).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                      <p className="font-medium">{submission.challenge?.title ?? "Challenge"}</p>
                      <p className="text-xs text-muted-foreground">
                        {submission.gradedAt ? new Date(submission.gradedAt).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                  </div>
                  {submission.overallScore !== null && (
                    <Badge variant={submission.overallScore >= 80 ? "default" : "secondary"}>
                      {submission.overallScore}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No completed challenges yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{skillScores?.averageScore ?? 0}%</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{skillScores?.skillScores.length ?? 0}</div>
            <div className="text-xs text-muted-foreground">Skills</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{skillScores?.totalSubmissions ?? 0}</div>
            <div className="text-xs text-muted-foreground">Attempts</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
