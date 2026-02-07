"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema } from "~/lib/schemas";
import { z } from "zod";

const formSchema = jobSchema.omit({ companyId: true }).extend({
  isPaid: z.boolean(),
});
type JobFormData = z.infer<typeof formSchema>;
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Separator } from "~/app/_components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import { Label } from "~/app/_components/ui/label";
import {
  Briefcase,
  FileText,
  CheckCircle,
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  Lightbulb,
  AlertCircle,
  Target,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";



export default function PostJobPage() {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState(false);

  const createJob = api.job.create.useMutation({
    onSuccess: () => {
      toast.success("Job posted successfully!");
      router.push("/employer/jobs");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to post job: ${error.message}`);
    },
  });

  const { data: user } = api.user.me.useQuery();

  const form = useForm<JobFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      locationType: undefined,
      duration: undefined,
      isPaid: false,
      salaryRange: "",
      skillsRequired: "",
      experienceLevel: undefined,
      challengeTitle: "",
      challengeDescription: "",
      challengeType: "CODE",
      challengeTimeLimit: 60,
      challengeTasks: [{ title: "", description: "" }],
    },
  });

  // Challenge task management
  const challengeTasks = form.watch("challengeTasks") ?? [];
  
  const addTask = () => {
    const currentTasks = form.getValues("challengeTasks") ?? [];
    form.setValue("challengeTasks", [...currentTasks, { title: "", description: "" }]);
  };
  
  const removeTask = (index: number) => {
    const currentTasks = form.getValues("challengeTasks") ?? [];
    if (currentTasks.length > 1) {
      form.setValue("challengeTasks", currentTasks.filter((_, i) => i !== index));
    }
  };

  const updateTask = (index: number, field: "title" | "description", value: string) => {
    const currentTasks = form.getValues("challengeTasks") ?? [];
    const newTasks = [...currentTasks];
    newTasks[index] = { ...newTasks[index], [field]: value } as { title: string; description: string };
    form.setValue("challengeTasks", newTasks);
  };

  const onSubmit = (data: JobFormData) => {
    if (!user?.companyId) {
      toast.error("You need to belong to a company to post a job.");
      return;
    }
    
    // Validate challenge if being created
    if (data.challengeTitle || data.challengeTasks?.some(t => t.title || t.description)) {
      if (!data.challengeTitle || data.challengeTitle.length < 3) {
        toast.error("Challenge title is required (min 3 characters)");
        return;
      }
      if (!data.challengeTasks || data.challengeTasks.length === 0 || 
          !data.challengeTasks.some(t => t.title && t.description)) {
        toast.error("At least one complete challenge task is required");
        return;
      }
    }
    
    createJob.mutate({ ...data, companyId: user.companyId });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (!user.companyId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Company Required</CardTitle>
            <CardDescription>
              You need to create a company profile before posting jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employer/onboarding">Create Company</Link>
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
            <Link href="/employer/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Post New Internship</h1>
            <p className="text-muted-foreground mt-1">
              Create an internship posting with AI-powered candidate matching
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
                Provide essential information about the internship position
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
                        {field.value?.length || 0}/500 characters (minimum 20 required)
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Job Details Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Job Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="locationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Type</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select location type</option>
                              <option value="remote">Remote</option>
                              <option value="onsite">On-site</option>
                              <option value="hybrid">Hybrid</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (months)</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Select duration</option>
                              <option value="1">1 month</option>
                              <option value="2">2 months</option>
                              <option value="3">3 months</option>
                              <option value="4">4 months</option>
                              <option value="5">5 months</option>
                              <option value="6">6 months</option>
                              <option value="9">9 months</option>
                              <option value="12">12 months</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isPaid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compensation</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              value={field.value ? "paid" : "unpaid"}
                              onChange={(e) => field.onChange(e.target.value === "paid")}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("isPaid") && (
                      <FormField
                        control={form.control}
                        name="salaryRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salary Range</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. $15-25/hr or $2000/month"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select experience level</option>
                            <option value="beginner">Beginner (First internship)</option>
                            <option value="intermediate">Intermediate (Some experience)</option>
                            <option value="advanced">Advanced (Multiple internships)</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skillsRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills Required</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. JavaScript, React, Node.js, SQL"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Separate skills with commas. AI will use this to match candidates.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Challenge Creation Section */}
                <div className="space-y-6 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Skill Sprint Challenge</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create a challenge that candidates must complete to apply. This proves their skills before you review their application.
                  </p>

                  <FormField
                    control={form.control}
                    name="challengeTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Challenge Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Build a React Component"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="challengeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Challenge Type</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="CODE">Code Challenge</option>
                            <option value="DESIGN">Design Task</option>
                            <option value="WRITING">Writing Assignment</option>
                            <option value="ANALYTICAL">Analytical Problem</option>
                            <option value="DEBUGGING">Debug Exercise</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="challengeDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Challenge Overview</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Describe what the candidate needs to build or solve..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="challengeTimeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={5}
                            max={180}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tasks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Tasks ({challengeTasks.length})</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTask}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>

                    {challengeTasks.map((task, index) => (
                      <Card key={index} className="border-muted">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Task {index + 1}</CardTitle>
                            {challengeTasks.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTask(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label>Task Title</Label>
                            <Input
                              placeholder="e.g., Implement the login form"
                              value={task.title}
                              onChange={(e) => updateTask(index, "title", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Task Description</Label>
                            <Textarea
                              placeholder="Detailed instructions for this task..."
                              rows={2}
                              value={task.description}
                              onChange={(e) => updateTask(index, "description", e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/employer/jobs")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createJob.isPending}
                    className="gap-2 min-w-[140px]"
                  >
                    {createJob.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Post Job
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
                      <Badge variant="secondary">Open</Badge>
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

                  {watchedValues.challengeDescription && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">TECHNICAL CHALLENGE</h4>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-foreground line-clamp-3">
                          {watchedValues.challengeDescription}
                        </p>
                      </div>
                    </div>
                  )}
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
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Be specific:</strong> Clear requirements attract better candidates
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Test real skills:</strong> Focus on practical coding challenges
                </p>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  <strong>Include learning:</strong> Mention what interns will gain from the role
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
