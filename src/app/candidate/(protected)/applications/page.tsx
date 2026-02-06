import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/app/_components/ui/table"; // Need to install table
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import { Input } from "~/app/_components/ui/input";

export default async function CandidateApplicationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // TODO: Fetch real applications via TRPC
  // const applications = await api.application.listMyApplications.query();
  
  // Mock Data
  const applications = [
    { id: "1", jobTitle: "Frontend Intern", company: "Tech Corp", status: "submitted", date: "2023-10-01" },
    { id: "2", jobTitle: "Backend Intern", company: "Startup Inc", status: "reviewing", date: "2023-10-05" },
    { id: "3", jobTitle: "Design Intern", company: "Creative Studio", status: "rejected", date: "2023-09-20" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
           <p className="text-gray-500">Track the status of your internship applications.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
           <Input placeholder="Search applications..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.jobTitle}</TableCell>
                <TableCell>{app.company}</TableCell>
                <TableCell>{app.date}</TableCell>
                <TableCell>
                  <Badge variant={
                    app.status === "submitted" ? "outline" : 
                    app.status === "reviewing" ? "secondary" : 
                    app.status === "rejected" ? "destructive" : "default"
                  }>
                    {app.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/candidate/applications/${app.id}`}>
                        View <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
