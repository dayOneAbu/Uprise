import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "~/app/_components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { 
  Briefcase, 
  FileText, 
  TrendingUp,
  ArrowRight,
  Plus,
  Sparkles,
  Activity,
  Users
} from "lucide-react";
import { api } from "~/trpc/server";
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

export default async function EmployerDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/employer/auth/login");
  }

  // Fetch real data
  const companyId = session.user.companyId;
  const [jobsResult, contracts] = await Promise.all([
    companyId 
      ? api.job.list({ limit: 100, companyId })
      : Promise.resolve({ jobs: [], nextCursor: undefined }),
    api.contract.listMyContracts(),
  ]);

  const jobs = jobsResult.jobs;
  const activeJobs = jobs.filter(job => job.status === "OPEN");
  
  // Get recent applications from active jobs
  const recentApplications = await Promise.all(
    activeJobs.slice(0, 5).map(async (job) => {
      try {
        const apps = await api.application.listByJob({ jobId: job.id });
        return apps.map(app => ({
          ...app,
          jobTitle: job.title,
        }));
      } catch {
        return [];
      }
    })
  ).then(results => results.flat().slice(0, 5));

  const totalApplications = recentApplications.length;
  const activeContracts = contracts.filter(c => c.status === "ACTIVE");
  const completedContracts = contracts.filter(c => c.status === "COMPLETED");

  const stats = [
    { 
      label: "Active Jobs", 
      value: activeJobs.length.toString(), 
      change: `${activeJobs.length} open positions`,
      icon: Briefcase,
      trend: "neutral" as const,
      description: "Jobs currently accepting applications"
    },
    { 
      label: "Total Applications", 
      value: totalApplications.toString(), 
      change: "Recent submissions",
      icon: Users,
      trend: "positive" as const,
      description: "Applications received this week"
    },
    { 
      label: "Active Contracts", 
      value: activeContracts.length.toString(), 
      change: `${completedContracts.length} completed`,
      icon: FileText,
      trend: "positive" as const,
      description: "Currently active internships"
    },
    { 
      label: "Success Rate", 
      value: contracts.length > 0 
        ? `${Math.round((completedContracts.length / contracts.length) * 100)}%`
        : "0%", 
      change: "Completion rate",
      icon: TrendingUp,
      trend: "positive" as const,
      description: "Contract completion percentage"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Welcome back, {session.user.name?.split(' ')[0] ?? 'there'}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Here&apos;s what&apos;s happening with your hiring pipeline today.
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/employer/jobs/new">
              <Plus className="h-4 w-4" />
              Post a Job
            </Link>
          </Button>
        </div>
      </div>

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
        {/* Recent Applications / Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Latest applications and updates
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/employer/applications" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-0">
              {recentApplications.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentApplications.slice(0, 5).map((application) => (
                    <Link
                      key={application.id}
                      href={`/employer/applications/${application.id}`}
                      className="block p-4 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                          {application.candidate?.id?.slice(0, 2).toUpperCase() ?? "??"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              New application received
                            </p>
                            {application.score !== null && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                {application.score}% score
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            For <span className="font-medium">{application.jobTitle}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(new Date(application.createdAt))}
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
                  <p className="text-sm font-medium text-foreground mb-1">No recent activity</p>
                  <p className="text-xs text-muted-foreground">
                    Applications will appear here once candidates start applying
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
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
                <Link href="/employer/jobs">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-foreground">Manage Jobs</div>
                      <div className="text-xs text-muted-foreground">Edit or close active listings</div>
                    </div>
                  </div>
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3 px-4 hover:bg-muted transition-colors"
                asChild
              >
                <Link href="/employer/applications">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-foreground">Review Applications</div>
                      <div className="text-xs text-muted-foreground">View and manage candidates</div>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3 px-4 hover:bg-muted transition-colors"
                asChild
              >
                <Link href="/employer/contracts">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-foreground">View Contracts</div>
                      <div className="text-xs text-muted-foreground">Manage active internships</div>
                    </div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Hiring Tip</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                Complete your company profile to attract up to 30% more candidates. Candidates value transparency about company culture and values.
              </CardDescription>
              <Button 
                size="sm" 
                variant="link" 
                className="px-0 mt-3 h-auto text-primary hover:text-primary/80"
                asChild
              >
                <Link href="/employer/profile">
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
