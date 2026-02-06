import Link from "next/link";
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { api, HydrateClient } from "~/trpc/server";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Plus, Briefcase, Calendar, Edit, Eye, Copy, Archive, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";

export default async function EmployerJobsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const companyId = session?.user.companyId;
  const { jobs } = await api.job.list({
    limit: 50,
    companyId: companyId ?? undefined
  });

  // Get application counts for each job
  const jobsWithCounts = await Promise.all(
    jobs.map(async (job) => {
      try {
        const applications = await api.application.listByJob({ jobId: job.id });
        return { ...job, applicationCount: applications.length };
      } catch {
        return { ...job, applicationCount: 0 };
      }
    })
  );

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">My Jobs</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage your job postings and track applications
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/employer/jobs/new">
              <Plus className="h-4 w-4" />
              Post New Job
            </Link>
          </Button>
        </div>

        {jobsWithCounts.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No jobs posted yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Get started by posting your first job opening
              </p>
              <Button asChild>
                <Link href="/employer/jobs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobsWithCounts.map((job) => (
              <Card key={job.id} className="border-border/50 hover:border-border transition-all hover:shadow-md group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/employer/jobs/${job.id}`}>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors mb-2 cursor-pointer">
                          {job.title}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge
                          variant={job.status === "OPEN" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {job.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{job.applicationCount} applications</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Job Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/employer/jobs/${job.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/employer/jobs/${job.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate Job
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Archive className="h-4 w-4 mr-2" />
                          {job.status === "OPEN" ? "Close Job" : "Reopen Job"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {job.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Skill Sprint Required
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </HydrateClient>
  );
}
