import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Badge } from "~/app/_components/ui/badge";
import Link from "next/link";
import { 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  Sparkles,
  Activity,
  Award
} from "lucide-react";

// Simple date formatting helper
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACCEPTED":
    case "COMPLETED":
      return "default";
    case "SUBMITTED":
      return "secondary";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function CandidateDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/candidate/auth/login");
  }

  // Fetch real data
  const [applications, contracts, jobsResult, jssData] = await Promise.all([
    api.application.listMyApplications(),
    api.contract.listMyContracts(),
    api.job.list({ limit: 6 }),
    api.user.getJSS({ userId: session.user.id }),
  ]);

  const submittedApplications = applications.filter(app => app.status === "SUBMITTED");
  const acceptedApplications = applications.filter(app => app.status === "ACCEPTED");
  const activeContracts = contracts.filter(c => c.status === "ACTIVE");
  const completedContracts = contracts.filter(c => c.status === "COMPLETED");
  
  // Calculate success rate
  const successRate = applications.length > 0
    ? Math.round((acceptedApplications.length / applications.length) * 100)
    : 0;

  const stats = [
    { 
      label: "Total Applications", 
      value: applications.length.toString(), 
      change: `${submittedApplications.length} pending`,
      icon: FileText,
      trend: "neutral" as const,
      description: "Applications you've submitted"
    },
    { 
      label: "In Review", 
      value: submittedApplications.length.toString(), 
      change: "Awaiting response",
      icon: Clock,
      trend: "neutral" as const,
      description: "Applications being reviewed"
    },
    { 
      label: "Active Contracts", 
      value: activeContracts.length.toString(), 
      change: `${completedContracts.length} completed`,
      icon: Briefcase,
      trend: "positive" as const,
      description: "Currently active internships"
    },
    { 
      label: "Success Rate", 
      value: `${successRate}%`, 
      change: "Acceptance rate",
      icon: TrendingUp,
      trend: successRate >= 50 ? "positive" as const : "neutral" as const,
      description: "Application acceptance percentage"
    },
  ];

  const recentApplications = applications.slice(0, 5);
  const recommendedJobs = jobsResult.jobs.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Welcome back, {session.user.name?.split(' ')[0] ?? 'there'}!
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Here&apos;s what&apos;s happening with your internship search today.
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/candidate/jobs">
              <Plus className="h-4 w-4" />
              Find Jobs
            </Link>
          </Button>
        </div>
      </div>

      {/* JSS Score Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-full">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Job Success Score</h3>
                <p className="text-sm text-muted-foreground">
                  Your reputation and performance rating
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary mb-1">
                {jssData.score}
              </div>
              <Badge variant="outline" className="text-xs">
                {jssData.badge}
              </Badge>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Completion Rate</span>
              <div className="font-medium text-foreground">{jssData.breakdown.completionRate}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Rating</span>
              <div className="font-medium text-foreground">{jssData.breakdown.avgPublicRating}/5</div>
            </div>
            <div>
              <span className="text-muted-foreground">AI Score</span>
              <div className="font-medium text-foreground">{jssData.breakdown.avgAiScore}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Contracts</span>
              <div className="font-medium text-foreground">{jssData.breakdown.totalContracts}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-border/50 hover:border-border transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div
                className={`p-2 rounded-lg ${
                  stat.trend === "positive"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
                {stat.trend === "positive" && (
                  <TrendingUp className="h-3 w-3 text-primary" />
                )}
                <span className={stat.trend === "positive" ? "text-primary" : "text-muted-foreground"}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recent Applications</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your latest job applications
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/candidate/applications" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-0">
              {recentApplications.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentApplications.map((application) => (
                    <Link
                      key={application.id}
                      href={`/candidate/applications`}
                      className="block p-4 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                          {application.job?.company?.name?.slice(0, 2).toUpperCase() ?? "??"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {application.job?.title ?? "Unknown Position"}
                            </p>
                            <Badge variant={getStatusBadgeVariant(application.status)} className="text-xs">
                              {application.status}
                            </Badge>
                            {application.score !== null && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                {application.score}% score
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {application.job?.company?.name ?? "Unknown Company"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Applied {formatTimeAgo(new Date(application.createdAt))}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-medium text-foreground mb-1">No applications yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Start applying to jobs to see your applications here
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/candidate/jobs">
                      Browse Jobs
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recommended Jobs */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Common tasks and shortcuts
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3 px-4 hover:bg-muted transition-colors"
                asChild
              >
                <Link href="/candidate/jobs">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-foreground">Browse Jobs</div>
                      <div className="text-xs text-muted-foreground">Find new opportunities</div>
                    </div>
                  </div>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3 px-4 hover:bg-muted transition-colors"
                asChild
              >
                <Link href="/candidate/applications">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-foreground">My Applications</div>
                      <div className="text-xs text-muted-foreground">Track your submissions</div>
                    </div>
                  </div>
                </Link>
              </Button>

              {activeContracts.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto py-3 px-4 hover:bg-muted transition-colors"
                  asChild
                >
                  <Link href="/candidate/contracts">
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-foreground">My Contracts</div>
                        <div className="text-xs text-muted-foreground">View active internships</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recommended Jobs */}
          {recommendedJobs.length > 0 && (
            <>
              <div>
                <h2 className="text-xl font-bold text-foreground">Recommended for You</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Jobs matching your profile
                </p>
              </div>
              <div className="space-y-3">
                {recommendedJobs.map((job) => (
                  <Link key={job.id} href={`/candidate/jobs/${job.id}`}>
                    <Card className="border-border/50 hover:border-border transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Open
                          </Badge>
                        </div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {job.company?.name ?? "Unknown Company"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Skill Sprint</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Tips Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Pro Tip</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Complete your profile to increase your visibility to employers. Add your skills, portfolio, and experience to stand out.
              </CardDescription>
              <Button 
                size="sm" 
                variant="link" 
                className="px-0 mt-3 h-auto text-primary hover:text-primary/80"
                asChild
              >
                <Link href="/candidate/profile">
                  Update Profile
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
