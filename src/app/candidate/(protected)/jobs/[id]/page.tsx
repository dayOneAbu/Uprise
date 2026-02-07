"use client";

import { api } from "~/trpc/react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import {
  ArrowLeft,
  Building,
  FileText,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

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
    setIsSubmitting(true);
    applyMutation.mutate({
      jobId
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
              The job you&apos;re looking for doesn&apos;t exist or may have been removed.
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
                    <Image
                      src={job.company.logoUrl}
                      alt={job.company.name}
                      width={64}
                      height={64}
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
                    uprise.com/c/{job.company?.slug}
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

          {/* Job Requirements */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                Job Requirements & Skills
              </CardTitle>
              <CardDescription>
                Skills and experience needed for this internship
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">REQUIRED SKILLS</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired?.trim() ? (
                      job.skillsRequired.split(',').map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill.trim()}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No specific skills listed</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">EXPERIENCE LEVEL</h4>
                  <Badge variant="outline" className="capitalize">
                    {job.experienceLevel ?? "Not specified"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">LOCATION</h4>
                  <p className="text-sm capitalize">{job.locationType ?? "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">DURATION</h4>
                  <p className="text-sm">{job.duration ? `${job.duration} months` : "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">COMPENSATION</h4>
                  <p className="text-sm">
                    {job.isPaid ? (job.salaryRange ?? "Paid") : "Unpaid"}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>AI Matching:</strong> Our AI analyzes your profile, skills, and experience to determine the best internship matches. Apply now to be considered!
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
                  Apply for this Internship
                </CardTitle>
                <CardDescription>
                  Express your interest in this internship opportunity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>AI Matching:</strong> Your application will be evaluated based on how well your skills,
                    experience, and profile match the internship requirements. No technical assessment required!
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Application Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Job Level:</span>
                      <p className="font-medium capitalize">{job.experienceLevel ?? "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleApply}
                  disabled={isSubmitting}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Apply Now
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your profile will be matched against this internship automatically
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