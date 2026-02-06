import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card"; // Assuming card exists or I need to install it
import { Badge } from "~/app/_components/ui/badge"; // Need to install badge
import { Button } from "~/app/_components/ui/button";
import Link from "next/link";
import { Briefcase, FileText, CheckCircle, Clock } from "lucide-react";

export default async function CandidateDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Mock data for now until we have seeded data
  const stats = [
    { label: "Applications", value: 12, icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "In Review", value: 5, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Interviews", value: 2, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Offers", value: 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user.name}!</h1>
          <p className="text-gray-500 mt-1">Here is what is happening with your internship search.</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/candidate/jobs">Find Jobs</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`h-12 w-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
                <Link href="/candidate/applications" className="text-indigo-600 font-medium hover:underline text-sm">View All</Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Placeholder for when we fetch real applications */}
                <div className="p-8 text-center text-gray-500">
                    <div className="inline-flex h-16 w-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-gray-300" />
                    </div>
                    <p>You haven&apos;t started any applications yet.</p>
                    <Button variant="link" asChild className="mt-2 text-indigo-600 px-0">
                        <Link href="/candidate/jobs">Browse Openings</Link>
                    </Button>
                </div>
            </div>
        </div>

        {/* Recommended Jobs Sidebar */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                             <div className="h-10 w-10 bg-gray-100 rounded-lg" />
                             <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">Remote</span>
                        </div>
                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition">Frontend Developer Intern {i}</h3>
                        <p className="text-sm text-gray-500 mb-3">Tech Corp Inc.</p>
                        <div className="flex gap-2 text-xs text-gray-400">
                            <span>$20/hr</span>
                            <span>•</span>
                            <span>Full-time</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
