"use client";

import { toast } from "sonner";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { UserRole } from "~/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { GraduationCap, Briefcase } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const setRole = api.user.setRole.useMutation({
    onSuccess: (data) => {
       if (data.role === UserRole.EMPLOYER) {
           router.push("/employer/jobs");
       } else if (data.role === UserRole.CANDIDATE) {
           router.push("/candidate");
       } else {
           router.push("/");
       }
       router.refresh();
    },
    onError: (err) => {
        toast.error("Failed to set role: " + err.message);
    }
  });

  const handleSelectRole = (role: "CANDIDATE" | "EMPLOYER") => {
    const roleEnum = role === "CANDIDATE" ? UserRole.CANDIDATE : UserRole.EMPLOYER;
    setRole.mutate({ role: roleEnum });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to MeritMatch!</h1>
            <p className="text-xl text-muted-foreground mt-2">To get started, please tell us how you want to use the platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Selection */}
            <Card className="hover:border-primary hover:shadow-xl transition-all cursor-pointer group border-border/50" onClick={() => handleSelectRole("CANDIDATE")}>
                <CardHeader className="text-center pt-8">
                    <div className="mx-auto h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <GraduationCap size={32} />
                    </div>
                    <CardTitle className="text-2xl">I&apos;m a Candidate</CardTitle>
                    <CardDescription>I want to find internships and build my career.</CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <Button variant="outline" className="w-full" disabled={setRole.isPending}>
                       Select Candidate
                    </Button>
                </CardContent>
            </Card>

            {/* Employer Selection */}
            <Card className="hover:border-primary hover:shadow-xl transition-all cursor-pointer group border-border/50" onClick={() => handleSelectRole("EMPLOYER")}>
                <CardHeader className="text-center pt-8">
                    <div className="mx-auto h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Briefcase size={32} />
                    </div>
                    <CardTitle className="text-2xl">I&apos;m an Employer</CardTitle>
                    <CardDescription>I want to hire talented interns for my company.</CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <Button variant="outline" className="w-full" disabled={setRole.isPending}>
                       Select Employer
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
