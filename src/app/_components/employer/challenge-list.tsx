"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Plus, Edit, Trash2, Eye, Play, Pause } from "lucide-react";
import Link from "next/link";
import type { ChallengeType } from "../../../../generated/prisma";

const challengeTypeLabels: Record<ChallengeType, string> = {
  CODE: "Code Challenge",
  DESIGN: "Design Task",
  WRITING: "Writing Assignment",
  ANALYTICAL: "Analytical Problem",
  DEBUGGING: "Debug Exercise",
};

const challengeTypeColors: Record<ChallengeType, string> = {
  CODE: "bg-blue-100 text-blue-800",
  DESIGN: "bg-purple-100 text-purple-800",
  WRITING: "bg-green-100 text-green-800",
  ANALYTICAL: "bg-orange-100 text-orange-800",
  DEBUGGING: "bg-red-100 text-red-800",
};

export function ChallengeList() {
  const { data: challenges, isLoading, refetch } = api.challenge.listMyChallenges.useQuery();
  const publishMutation = api.challenge.publish.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteMutation = api.challenge.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this challenge? This action cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync({ id });
    } catch {
      alert("Failed to delete challenge. It may have existing submissions.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    await publishMutation.mutateAsync({ id, isPublished: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24" />
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
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No challenges yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-4">
            Create skill-based challenges to evaluate candidates. Replace CV screening with proven ability.
          </p>
          <Button asChild>
            <Link href="/employer/challenges/new">
              <Plus className="h-4 w-4 mr-2" />
              Create First Challenge
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <Card key={challenge.id} className={!challenge.isPublished ? "opacity-75" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  {!challenge.isPublished && (
                    <Badge variant="outline" className="text-xs">Draft</Badge>
                  )}
                </div>
                <Badge className={challengeTypeColors[challenge.type]}>
                  {challengeTypeLabels[challenge.type]}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePublishToggle(challenge.id, challenge.isPublished)}
                  title={challenge.isPublished ? "Unpublish" : "Publish"}
                >
                  {challenge.isPublished ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/employer/challenges/${challenge.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/employer/challenges/${challenge.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(challenge.id)}
                  disabled={deletingId === challenge.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {challenge.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{challenge.tasks.length} tasks</span>
              {challenge.timeLimit && <span>• {challenge.timeLimit} min limit</span>}
              {challenge._count?.submissions > 0 && (
                <span>• {challenge._count.submissions} submissions</span>
              )}
              {challenge.job && (
                <span>• Linked to: {challenge.job.title}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
