"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateJobSchema } from "~/lib/schemas";
import { api } from "~/trpc/react";
import { useRouter, useParams } from "next/navigation";
import { type z } from "zod";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Separator } from "~/app/_components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import {
  Briefcase,
  FileText,
  Code,
  CheckCircle,
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Lightbulb,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

type JobFormData = z.infer<typeof updateJobSchema>;

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const [previewMode, setPreviewMode] = useState(false);

  const { data: job, isLoading: jobLoading } = api.job.get.useQuery({ id: jobId });

  const updateJob = api.job.update.useMutation({
    onSuccess: () => {
      toast.success("Job updated successfully!");
      router.push(`/employer/jobs/${jobId}`);
    },
    onError: (error) => {
      toast.error(`Failed to update job: ${error.message}`);
    },
  });

  const form = useForm<JobFormData>({
    resolver: zodResolver(updateJobSchema),
    defaultValues: {
      id: jobId,
      title: "",
      description: "",
    },
  });

  // Populate form when job data loads
  useEffect(() => {
    if (job) {
      form.reset({
        id: jobId,
        title: job.title,
        description: job.description,
      });
    }
  }, [job, jobId, form]);

  const onSubmit = (data: JobFormData) => {
    updateJob.mutate(data);
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
              The job you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have permission to edit it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employer/jobs">Back to Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const watchedValues = form.watch();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/employer/jobs/${jobId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Edit Job</h1>
            <p className="text-muted-foreground mt-1">
              Update job details and assessment requirements
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
            {job.status}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Details
              </CardTitle>
              <CardDescription>
                Update the job information and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Job Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Frontend Developer Intern"
                            className="text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Job Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="Describe the role responsibilities, requirements, and what the intern will learn..."
                            className="text-base resize-none"
                            {...field}
                          />
                        </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {(field.value?.length ?? 0)}/500 characters (minimum 20 required)
                      </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* AI Test Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">AI-Powered Skill Assessment</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Define a technical challenge that candidates will complete to demonstrate their skills.
                    </p>

                    {/* Challenge editing currently not supported via this form - see new job form for structure */}
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/employer/jobs/${jobId}`)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateJob.isPending}
                      className="gap-2 min-w-[140px]"
                    >
                      {updateJob.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Update Job
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview/Sidebar */}
        <div className="space-y-6">
          {/* Preview Card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Job Preview
              </CardTitle>
              <CardDescription>
                How candidates will see this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              {watchedValues.title ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {watchedValues.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
                        {job.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Skill Sprint Required</span>
                    </div>
                  </div>

                  {watchedValues.description && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">DESCRIPTION</h4>
                      <p className="text-sm text-foreground line-clamp-4">
                        {watchedValues.description}
                      </p>
                    </div>
                  )}

{/* Challenge preview removed until editing is supported */}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Fill out the form to see a preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Lightbulb className="h-5 w-5" />
                Editing Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Keep it current:</strong> Update requirements based on recent hires
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Test effectiveness:</strong> Refine challenges based on candidate performance
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Status matters:</strong> Close jobs when positions are filled
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}