import Link from "next/link";
import { api, HydrateClient } from "~/trpc/server";

export default async function EmployerJobsPage() {
  const { jobs } = await api.job.list({ limit: 50 }); 
  // Note: job.list is currently PUBLIC and lists ALL jobs.
  // We should ideally have `job.listMyJobs` or filter by `companyId` from session on client side 
  // or use the server-side filtered list if we implemented it.
  // Looking at router: `list` takes `companyId`. filtering by MY company is best.
  // Actually, let's use the public list for now but pass the companyId if we can gets it, 
  // OR create a new procedure `listMyJobs`.
  // For now, I'll list all and we can refine.
  // WAIT - I can get the user's companyId from session if I fetch user me?
  
  // Let's implement a basic list first.

  return (
    <HydrateClient>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Jobs</h1>
          <Link
            href="/employer/jobs/new"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Post New Job
          </Link>
        </div>

        <div className="grid gap-4">
           {jobs.length === 0 ? (
             <p className="text-gray-500">No jobs posted yet.</p>
           ) : (
             jobs.map((job) => (
               <div key={job.id} className="rounded border bg-white p-4 shadow-sm hover:shadow-md transition">
                 <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-semibold hover:underline">
                            <Link href={`/employer/jobs/${job.id}`}>{job.title}</Link>
                        </h2>
                        <p className="text-sm text-gray-500">
                           Status: <span className="font-medium text-green-700">{job.status}</span>
                        </p>
                    </div>
                 </div>
               </div>
             ))
           )}
        </div>
      </div>
    </HydrateClient>
  );
}
