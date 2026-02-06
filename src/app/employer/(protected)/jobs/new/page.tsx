"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema } from "~/lib/schemas";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { type z } from "zod";

type JobFormData = z.infer<typeof jobSchema>;

export default function PostJobPage() {
  const router = useRouter();
  const createJob = api.job.create.useMutation({
    onSuccess: () => {
      router.push("/employer/jobs");
      router.refresh();
    },
  });

  // We need companyId. for now lets hardcode or fetch from session if possible?
  // Schema requires companyId.
  // In the real app, we should probably fetch the user's company and auto-fill this.
  // For now, let's assume the user knows their company ID or we fetch it.
  // Actually, the layouts fetch session, maybe we can pass it down? 
  // Client components can't easily get server session passed unless via context.
  // Let's rely on a `me` query to get the company ID.
  
  const { data: user } = api.user.me.useQuery();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      testPrompt: "",
      // companyId will be set before submit
      // gradingRubric is optional
    },
  });

  const onSubmit = (data: JobFormData) => {
    if (!user?.companyId) {
      alert("You need to belong to a company to post a job.");
      return;
    }
    createJob.mutate({ ...data, companyId: user.companyId });
  };

  if (!user) return <div>Loading user...</div>;
  if (!user.companyId) return <div>You must create a company first.</div>;

  return (
    <div className="mx-auto max-w-2xl bg-white p-6 shadow rounded">
      <h1 className="mb-6 text-2xl font-bold">Post a New Job</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Job Title</label>
          <input
            {...form.register("title")}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            placeholder="Frontend Intern"
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
             {...form.register("description")}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            placeholder=" Describe responsibilities..."
          />
           {form.formState.errors.description && (
            <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Test Prompt</label>
          <textarea
             {...form.register("testPrompt")}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            placeholder="e.g. Build a Todo app using React..."
          />
           {form.formState.errors.testPrompt && (
            <p className="text-red-500 text-sm">{form.formState.errors.testPrompt.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={createJob.isPending}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createJob.isPending ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}
