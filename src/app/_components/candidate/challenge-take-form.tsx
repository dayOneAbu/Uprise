"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/app/_components/ui/card";
import { Textarea } from "~/app/_components/ui/textarea";
import { Label } from "~/app/_components/ui/label";
import { AlertCircle, Clock, ChevronRight, ChevronLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChallengeTakeFormProps {
  challengeId: string;
}

export function ChallengeTakeForm({ challengeId }: ChallengeTakeFormProps) {
  const router = useRouter();
  const [currentTask, setCurrentTask] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const { data: challenge, isLoading } = api.challenge.get.useQuery({ id: challengeId });
  const submitMutation = api.submission.submit.useMutation({
    onSuccess: () => {
      router.push("/candidate/challenges");
    },
    onError: (error) => {
      alert(error.message);
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (challenge?.timeLimit && hasStarted) {
      const limitInSeconds = challenge.timeLimit * 60;
      setTimeLeft(limitInSeconds);
      
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [challenge?.timeLimit, hasStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  const updateResponse = (taskId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [taskId]: value }));
  };

  const handleSubmit = async () => {
    if (!challenge) return;

    // Check all tasks have responses
    const missingTasks = challenge.tasks.filter((t: { id: string }) => !responses[t.id]?.trim());
    if (missingTasks.length > 0) {
      alert(`Please complete all tasks before submitting. Missing: ${missingTasks.length} task(s)`);
      return;
    }

    if (!confirm("Are you sure you want to submit? You cannot edit after submission.")) {
      return;
    }

    setIsSubmitting(true);

    submitMutation.mutate({
      challengeId,
      taskResponses: challenge.tasks.map((t: { id: string }) => ({
        taskId: t.id,
        response: responses[t.id] ?? "",
      })),
    });
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-96" />
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p>Challenge not found</p>
        </CardContent>
      </Card>
    );
  }

  const tasks = challenge.tasks || [];
  const currentTaskData = tasks[currentTask];

  if (!hasStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{challenge.title}</CardTitle>
          <CardDescription>
            {challenge.employer.name} • {challenge.type}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <p>{challenge.description}</p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Limit: {challenge.timeLimit ? `${challenge.timeLimit} minutes` : "No time limit"}
            </h4>
            <p className="text-sm text-muted-foreground">
              Once you start, the timer will begin. You cannot pause or resume.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Tasks ({tasks.length})</h4>
            <ul className="space-y-2 text-sm">
              {tasks.map((t: { title: string }, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </span>
                  {t.title}
                </li>
              ))}
            </ul>
          </div>

          <Button size="lg" className="w-full" onClick={handleStart}>
            Start Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          <p className="text-muted-foreground">Task {currentTask + 1} of {tasks.length}</p>
        </div>
        {timeLeft !== null && (
          <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-destructive' : ''}`}>
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${((currentTask + 1) / tasks.length) * 100}%` }}
        />
      </div>

      {/* Current Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {currentTask + 1}
            </span>
            {currentTaskData?.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{currentTaskData?.description}</p>
          
          <div>
            <Label htmlFor={`response-${currentTask}`}>Your Response</Label>
            <Textarea
              id={`response-${currentTask}`}
              placeholder="Enter your solution here..."
              rows={8}
              value={responses[currentTaskData?.id ?? ""] ?? ""}
              onChange={(e) => {
                 if(currentTaskData?.id) updateResponse(currentTaskData.id, e.target.value)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentTask((prev) => Math.max(0, prev - 1))}
          disabled={currentTask === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {tasks.map((_: unknown, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentTask(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === currentTask
                  ? 'bg-primary'
                   : tasks[idx] && responses[tasks[idx].id]
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {currentTask < tasks.length - 1 ? (
          <Button onClick={() => setCurrentTask((prev) => prev + 1)}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Challenge"}
          </Button>
        )}
      </div>
    </div>
  );
}
