import Link from "next/link";
import { api, HydrateClient } from "~/trpc/server";
import { notFound } from "next/navigation";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Parallel fetch: Job details AND Applications
  // We need to handle potential errors if job not found or auth fails
  let job, applications;
  try {
     job = await api.job.get({ id });
     applications = await api.application.listByJob({ jobId: id });
  } catch (e) {
      // In a real app, handle specific error codes (404, 403)
      // For now, if job fetch fails, 404.
      console.error(e);
      notFound();
  }

  if (!job) notFound();

  return (
    <HydrateClient>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <p className="text-gray-500">{job.company.name} • <span className={`font-medium ${job.status === 'OPEN' ? 'text-green-600' : 'text-gray-600'}`}>{job.status}</span></p>
          </div>
          <Link
            href={`/employer/jobs/${id}/edit`} 
            className="rounded border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50"
          >
            Edit Job
          </Link>
        </div>

        {/* Job Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <section className="bg-white p-4 rounded shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
                </section>
                
                <section className="bg-white p-4 rounded shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">Technical Test</h3>
                    <p className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-2 rounded border">{job.testPrompt}</p>
                </section>
            </div>

            {/* Applications Sidebar/List */}
            <div className="md:col-span-1">
                <div className="bg-white p-4 rounded shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Applications ({applications.length})</h3>
                    
                    <div className="flex flex-col gap-3">
                        {applications.length === 0 ? (
                            <p className="text-gray-500 text-sm">No applications yet.</p>
                        ) : (
                            applications.map((app) => (
                                <div key={app.id} className="border rounded p-3 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium">Candidate</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                                            app.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' :
                                            app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Applied: {app.createdAt.toLocaleDateString()}
                                    </p>
                                    <Link 
                                        href={`/employer/applications/${app.id}`}
                                        className="text-sm text-blue-600 hover:underline block text-right"
                                    >
                                        Review Application &rarr;
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </HydrateClient>
  );
}
