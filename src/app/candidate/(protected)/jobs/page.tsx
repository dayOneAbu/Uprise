import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { api } from "~/trpc/server";
import { Input } from "~/app/_components/ui/input";
import { Button } from "~/app/_components/ui/button";
import { Badge } from "~/app/_components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import Link from "next/link";
import { Search, MapPin, DollarSign, Clock, Briefcase } from "lucide-react";

export default async function CandidateJobsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { jobs } = await api.job.list({ limit: 50 });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
         <h1 className="text-4xl font-bold tracking-tight text-foreground">Find Your Dream Internship</h1>
         <p className="text-muted-foreground text-lg">Browse opportunities from top companies.</p>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Job title, keywords, or company" className="pl-10" />
            </div>
            <div className="relative md:w-1/4">
                 <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                 <Input placeholder="Location" className="pl-10" />
            </div>
            <Button className="md:w-32">Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No jobs available</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for new opportunities
            </p>
          </CardContent>
        </Card>
      ) : (
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Link key={job.id} href={`/candidate/jobs/${job.id}`}>
            <Card className="border-border/50 hover:border-border transition-all hover:shadow-md group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="h-14 w-14 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors mb-1">
                        {job.title}
                      </CardTitle>
                      <p className="text-muted-foreground mb-3">{job.company?.name ?? "Unknown Company"}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="font-normal">Skill Sprint</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between min-w-[140px]">
                    <div className="space-y-1 text-sm text-muted-foreground mb-4 md:mb-0">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} /> Remote
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground mb-4 md:mb-0">
                        <Clock size={14} /> Internship
                      </div>
                    </div>
                    <Button variant="outline" className="mt-4 w-full md:w-auto">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
