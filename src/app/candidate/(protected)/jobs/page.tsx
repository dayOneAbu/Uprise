import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { Input } from "~/app/_components/ui/input";
import { Button } from "~/app/_components/ui/button";
import { Badge } from "~/app/_components/ui/badge";
import Link from "next/link";
import { Search, MapPin, DollarSign, Clock } from "lucide-react";

export default async function CandidateJobsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Mock Jobs
  const jobs = [
    { id: "1", title: "Frontend Developer Intern", company: "Tech Corp", location: "Remote", salary: "$20/hr", type: "Full-time", tags: ["React", "TypeScript"] },
    { id: "2", title: "Backend Engineer Intern", company: "Data Systems", location: "New York, NY", salary: "$25/hr", type: "Part-time", tags: ["Node.js", "SQL"] },
    { id: "3", title: "UI/UX Design Intern", company: "Creative Flow", location: "San Francisco, CA", salary: "Unpaid", type: "Internship", tags: ["Figma", "Design"] },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
         <h1 className="text-3xl font-bold text-gray-900">Find Your Dream Internship</h1>
         <p className="text-gray-500">Browse thousands of openings from top companies.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input placeholder="Job title, keywords, or company" className="pl-10" />
        </div>
        <div className="relative md:w-1/4">
             <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
             <Input placeholder="Location" className="pl-10" />
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 md:w-32">Search</Button>
      </div>

      {/* Jobs List */}
      <div className="grid gap-4">
        {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-all group flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4">
                    <div className="h-14 w-14 bg-gray-100 rounded-lg flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">{job.title}</h3>
                        <p className="text-gray-500">{job.company}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                            {job.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-normal">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-start md:items-end justify-between min-w-[140px]">
                    <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <MapPin size={14} /> {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                            <DollarSign size={14} /> {job.salary}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={14} /> {job.type}
                        </div>
                    </div>
                    <Button asChild className="mt-4 w-full md:w-auto bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-none">
                        <Link href={`/candidate/jobs/${job.id}`}>View Details</Link>
                    </Button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
