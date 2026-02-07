
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { ArrowLeft, Calendar, Briefcase, MapPin, Building } from "lucide-react";
import Link from "next/link";

export default async function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/candidate/auth/login");
  }

  let application;
  try {
    application = await api.application.getById({ id });
  } catch {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Button variant="ghost" className="mb-4 pl-0" asChild>
            <Link href="/candidate/applications">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Applications
            </Link>
        </Button>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{application.job.title}</h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{application.job.company.name}</span>
                    <span className="mx-2">•</span>
                    <MapPin className="h-4 w-4" />
                    <span>{application.job.locationType}</span>
                </div>
            </div>
            <Badge className="text-lg px-4 py-1">
                {application.status}
            </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Application Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border-l-2 border-muted pl-4 space-y-8">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                            <div className="font-semibold">Application Submitted</div>
                            <div className="text-sm text-muted-foreground">{new Date(application.createdAt).toLocaleDateString()}</div>
                        </div>
                        {application.status !== 'SUBMITTED' && (
                             <div className="relative">
                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                                <div className="font-semibold">Status Updated: {application.status}</div>
                                <div className="text-sm text-muted-foreground">{new Date(application.createdAt).toLocaleDateString()}</div>
                            </div>
                        )}
                         <div className="relative">
                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-muted" />
                            <div className="text-muted-foreground">Review Pending</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <div className="font-medium">Job Type</div>
                            <div className="text-sm text-muted-foreground">{application.job.duration ? `${application.job.duration} months` : 'Permanent'}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <div className="font-medium">Applied On</div>
                            <div className="text-sm text-muted-foreground">{new Date(application.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                     <Button className="w-full" variant="outline" asChild>
                        <Link href={`/candidate/jobs/${application.jobId}`}>View Job Post</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
