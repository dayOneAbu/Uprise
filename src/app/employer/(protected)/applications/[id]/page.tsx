"use client";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function ApplicationReviewPage({
    _params,
}: {
    _params: Promise<{ id: string }>;
}) {
    // Unwrapping params is now async in simpler text, but specialized hook is not yet standard in 15? 
    // In strict Next.js 15, params is a promise.
    // However, since we are "use client", we might receive it already resolved IF we were a server component passing it down?
    // Wait, "use client" components receive params as a Promise? No, usually server components do.
    // Actually, let's keep it safe. We can use `use` from React if we want, or just wait.
    // BUT simpler pattern for client components in App Router:
    // It's often better to make the PAGE a server component that fetches data or passes ID to a client component.
    // Let's stick to the pattern I used in jobs/[id] which was a server component.
    // AH, I made `jobs/[id]` a server component.
    // Here I need interactivity (approve/reject), so I need a client component.
    // Plan: Page is Server Component -> fetches ID -> renders Client Component wrapper.
    // For simplicity/speed in prototype, I'll make the page a Client Component 
    // and rely on TRPC to fetch.
    // "use client" page params: In Next.js 15 they are promises. 
    // I will use `React.use()` or `await` in a wrapper? 
    // Easier: Just use `useParams()` from `next/navigation`.
    
    // REVISING APPROACH:
    // I will use `useParams` hook standard for client components.
    
    // WAIT: `params` prop is NOT available in `useParams`?
    // `useParams` returns the params object.
    
    return <ApplicationReviewClient />;
}

import { useParams } from "next/navigation";

function ApplicationReviewClient() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const { data: application, isLoading, error } = api.application.get.useQuery({ id });
    const updateStatus = api.application.updateStatus.useMutation({
        onSuccess: () => {
            router.refresh(); // Refresh server data
            // router.push("/employer/jobs/" + application?.jobId); // Optional: go back
        }
    });
    const createContract = api.contract.create.useMutation({
        onSuccess: () => {
            router.push("/employer/contracts");
        }
    });

    if (isLoading) return <div className="p-8">Loading application...</div>;
    if (error || !application) return <div className="p-8 text-red-500">Error loading application or not found.</div>;

    const handleStatusChange = (newStatus: "INTERVIEW" | "OFFER" | "REJECTED" | "ACCEPTED" | "SUBMITTED" | "REVIEWING") => {
        updateStatus.mutate({ id: application.id, status: newStatus });
    };

    const handleCreateContract = () => {
       createContract.mutate({ applicationId: application.id });
    };

    return (
        <div className="mx-auto max-w-4xl p-6">
            <button onClick={() => router.back()} className="mb-4 text-sm text-gray-500 hover:underline">&larr; Back</button>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b p-6 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Application for {application.job.title}</h1>
                        <div className="text-gray-600">Candidate: <span className="font-semibold text-gray-900">{application.candidate.name ?? "Hidden Name"}</span></div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                         <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-green-300' :
                            application.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-blue-100 text-blue-800 border-blue-300'
                        }`}>
                            {application.status}
                        </span>
                        <div className="text-xs text-gray-400">Applied {application.createdAt.toLocaleDateString()}</div>
                    </div>
                </div>

                <div className="p-6 grid gap-8">
                    {/* Answer Section */}
                    <section>
                        <h3 className="text-lg font-semibold mb-3 border-b pb-2">Candidate&apos;s Answer</h3>
                        <div className="bg-gray-50 p-4 rounded text-gray-800 whitespace-pre-wrap">
                            {application.answerContent}
                        </div>
                    </section>

                     {/* Profile Snapshot */}
                     {application.candidate.profile && (
                        <section>
                            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Candidate Profile</h3>
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-medium">Skills:</span> {application.candidate.profile.skills}</div>
                                <div><span className="font-medium">Location:</span> {application.candidate.profile.location}</div>
                                <div><span className="font-medium">Portfolio:</span> <a href={application.candidate.profile.portfolioUrl ?? '#'} target="_blank" className="text-blue-600 underline">Link</a></div>
                                <div><span className="font-medium">Success Rate:</span> {application.candidate.successRate}%</div>
                             </div>
                        </section>
                     )}

                     {/* Actions */}
                     <section className="bg-gray-100 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            {/* Status Buttons */}
                            {application.status !== 'REJECTED' && (
                                <button 
                                    onClick={() => handleStatusChange("REJECTED")}
                                    disabled={updateStatus.isPending}
                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50"
                                >
                                    Reject
                                </button>
                            )}
                             {application.status !== 'INTERVIEW' && application.status !== 'ACCEPTED' && (
                                <button 
                                    onClick={() => handleStatusChange("INTERVIEW")}
                                    disabled={updateStatus.isPending}
                                    className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded hover:bg-blue-50"
                                >
                                    Mark for Interview
                                </button>
                            )}
                            
                            {/* Make Offer / Accept */}
                             {application.status !== 'ACCEPTED' && (
                                <button 
                                    onClick={() => handleStatusChange("ACCEPTED")}
                                    disabled={updateStatus.isPending}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Accept / Offer
                                </button>
                            )}

                             {/* Create Contract (Only if accepted) */}
                            {application.status === 'ACCEPTED' && (
                                <button 
                                    onClick={handleCreateContract}
                                    disabled={createContract.isPending}
                                    className="ml-auto px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                                >
                                    Create Contract
                                </button>
                            )}
                        </div>
                     </section>
                </div>
            </div>
        </div>
    );
}
