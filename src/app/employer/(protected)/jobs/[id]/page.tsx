import Link from "next/link";
import { api, HydrateClient } from "~/trpc/server";
import { notFound } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Separator } from "~/app/_components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Eye,
  FileText,
  Users,
  Calendar,
  Code,
  CheckCircle,
  Clock,
  X,
  MoreHorizontal,
  Copy,
  Archive
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";

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

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "ACCEPTED": return "default";
      case "REJECTED": return "destructive";
      case "SUBMITTED": return "secondary";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED": return <CheckCircle className="h-3 w-3" />;
      case "REJECTED": return <X className="h-3 w-3" />;
      case "SUBMITTED": return <Clock className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <HydrateClient>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/employer/jobs">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{job.title}</h1>
              <p className="text-muted-foreground mt-1">
                {job.company.name} • Posted {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={job.status === "OPEN" ? "default" : "secondary"} className="text-sm">
              {job.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Job Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/employer/jobs/${id}/edit`}>
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
                  Close Job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Test */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  AI-Powered Skill Assessment
                </CardTitle>
                <CardDescription>
                  The technical challenge candidates must complete
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg border">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {job.testPrompt}
                  </p>
                </div>
                {job.gradingRubric && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Grading Criteria</h4>
                      <p className="text-sm text-foreground">
                        {job.gradingRubric}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Applications Overview */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Applications
                </CardTitle>
                <CardDescription>
                  {applications.length} candidate{applications.length !== 1 ? 's' : ''} applied
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No applications yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                            {app.candidate?.name ? (app.candidate.name as string).slice(0, 2).toUpperCase() : "??"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {app.candidate?.name ?? "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.score !== null && (
                            <span className="text-xs font-medium text-foreground">
                              {app.score}%
                            </span>
                          )}
                          <Badge variant={getStatusVariant(app.status)} className="text-xs">
                            {getStatusIcon(app.status)}
                            {app.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {applications.length > 5 && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/employer/applications?jobId=${id}`}>
                          View All {applications.length} Applications
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Applications</span>
                  <span className="font-medium">{applications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Posted</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
