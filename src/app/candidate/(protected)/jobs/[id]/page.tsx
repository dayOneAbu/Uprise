"use client";

import { api } from "~/trpc/react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Textarea } from "~/app/_components/ui/textarea";
import { Separator } from "~/app/_components/ui/separator";
import {
  ArrowLeft,
  Building,
  Calendar,
  Code,
  FileText,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: job, isLoading: jobLoading } = api.job.get.useQuery({ id: jobId });
  const { data: applicationStatus } = api.application.getMyApplicationStatus.useQuery({ jobId });

  const applyMutation = api.application.submit.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully! AI grading in progress...");
      router.push("/candidate/applications");
    },
    onError: (error) => {
      toast.error(`Failed to submit application: ${error.message}`);
      setIsSubmitting(false);
    }
  });

  const handleApply = () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer to the technical challenge");
      return;
    }

    setIsSubmitting(true);
    applyMutation.mutate({
      jobId,
      answerContent: answer
    });
  };

  if (jobLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Job Not Found</CardTitle>
            <CardDescription>
              The job you're looking for doesn't exist or may have been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasApplied = applicationStatus?.hasApplied;
  const application = applicationStatus?.application;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {job.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {job.company?.name} • Posted {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company & Job Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                About {job.company?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {job.company?.logoUrl && (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={job.company.logoUrl}
                      alt={job.company.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {job.company?.name}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    meritmatch.com/c/{job.company?.slug}
                  </p>
                  {job.company?.description && (
                    <p className="text-sm text-muted-foreground">
                      {job.company.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI-Powered Skill Assessment */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Code className="h-5 w-5" />
                Technical Challenge
              </CardTitle>
              <CardDescription>
                Complete this AI-graded assessment to demonstrate your skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg border">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {job.testPrompt}
                </p>
              </div>

              {job.gradingRubric && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Grading Criteria</h4>
                    <div className="bg-muted/50 p-3 rounded text-sm text-foreground">
                      <pre className="whitespace-pre-wrap">{job.gradingRubric}</pre>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>How it works:</strong> Submit your solution below. Our AI will grade it instantly and employers will see scores without names (blind recruitment).
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          {hasApplied && application ? (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {application.status === "SUBMITTED" && <Clock className="h-5 w-5 text-amber-600" />}
                  {application.status === "REVIEWING" && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                  {application.status === "ACCEPTED" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={
                    application.status === "ACCEPTED" ? "default" :
                    application.status === "REJECTED" ? "destructive" :
                    "secondary"
                  }>
                    {application.status}
                  </Badge>
                </div>

                {application.score && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">AI Score</span>
                    <span className="font-medium">{application.score}%</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Applied</span>
                  <span className="text-sm">{new Date(application.createdAt).toLocaleDateString()}</span>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/candidate/applications")}
                >
                  View Application Details
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Application Form */
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Apply for this Position
                </CardTitle>
                <CardDescription>
                  Submit your solution to the technical challenge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Your Solution *
                  </label>
                  <Textarea
                    placeholder="Write your code, explain your approach, and demonstrate your solution..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {answer.length}/2000 characters (minimum 50 required)
                  </p>
                </div>

                <Button
                  onClick={handleApply}
                  disabled={isSubmitting || answer.length < 50}
                  className="w-full gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your submission will be graded by AI within seconds
                </p>
              </CardContent>
            </Card>
          )}

          {/* Job Stats */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
                  {job.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Posted</span>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Skill Assessment</span>
                <span className="text-primary font-medium">AI-Graded</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}