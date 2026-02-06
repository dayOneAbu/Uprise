"use client";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Separator } from "~/app/_components/ui/separator";
import { Textarea } from "~/app/_components/ui/textarea";
import {
  ArrowLeft,
  User,
  FileText,
  Code,
  Calendar,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
  Loader2,
  MessageSquare,
  Star
} from "lucide-react";
import { toast } from "sonner";

export default function ApplicationReviewPage() {
    return <ApplicationReviewClient />;
}

import { useParams } from "next/navigation";

function ApplicationReviewClient() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [feedback, setFeedback] = useState("");

    const { data: application, isLoading, error } = api.application.get.useQuery({ id });
    const updateStatus = api.application.updateStatus.useMutation({
        onSuccess: () => {
            toast.success("Application status updated successfully!");
        },
        onError: (error) => {
            toast.error(`Failed to update status: ${error.message}`);
        }
    });
    const createContract = api.contract.create.useMutation({
        onSuccess: () => {
            toast.success("Contract created successfully!");
            router.push("/employer/contracts");
        },
        onError: (error) => {
            toast.error(`Failed to create contract: ${error.message}`);
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading application...</p>
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md">
                    <CardHeader className="text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <CardTitle>Application Not Found</CardTitle>
                        <CardDescription>
                            The application you're looking for doesn't exist or you don't have permission to view it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.back()}>
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleStatusChange = (newStatus: "INTERVIEW" | "OFFER" | "REJECTED" | "ACCEPTED" | "SUBMITTED" | "REVIEWING") => {
        updateStatus.mutate({ id: application.id, status: newStatus });
    };

    const handleCreateContract = () => {
       createContract.mutate({ applicationId: application.id });
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case "ACCEPTED": return "default";
            case "REJECTED": return "destructive";
            case "REVIEWING": return "secondary";
            default: return "outline";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "ACCEPTED": return <CheckCircle className="h-3 w-3" />;
            case "REJECTED": return <X className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">
                            Application Review
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Review and manage candidate application
                        </p>
                    </div>
                </div>
                <Badge variant={getStatusVariant(application.status)} className="text-sm gap-1">
                    {getStatusIcon(application.status)}
                    {application.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Candidate Overview */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Candidate Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                                    {application.candidate?.name ? application.candidate.name.split(' ').map(n => n[0]).join('') : "??"}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-foreground">
                                        {application.candidate?.name ?? "Unknown Candidate"}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {application.candidate?.email ?? ""}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                                        {application.score !== null && (
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3" />
                                                <span>Score: {application.score}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Context */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Job Position
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {application.job?.title ?? "Unknown Position"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {application.job?.company?.name ?? "Unknown Company"}
                            </p>
                            {application.job?.description && (
                                <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-2">JOB DESCRIPTION</h4>
                                    <p className="text-sm text-foreground line-clamp-3">
                                        {application.job.description}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Candidate Answer */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="h-5 w-5" />
                                Technical Challenge Response
                            </CardTitle>
                            <CardDescription>
                                Candidate's solution to the AI-powered skill assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted p-4 rounded-lg">
                                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                                    {application.answerContent}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Candidate Profile */}
                    {application.candidate?.profile && (
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Candidate Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {application.candidate.profile.skills && (
                                        <div>
                                            <span className="font-medium text-muted-foreground">Skills:</span>
                                            <p className="text-foreground mt-1">{application.candidate.profile.skills}</p>
                                        </div>
                                    )}
                                    {application.candidate.profile.location && (
                                        <div>
                                            <span className="font-medium text-muted-foreground">Location:</span>
                                            <p className="text-foreground mt-1">{application.candidate.profile.location}</p>
                                        </div>
                                    )}
                                    {application.candidate.profile.portfolioUrl && (
                                        <div>
                                            <span className="font-medium text-muted-foreground">Portfolio:</span>
                                            <p className="text-foreground mt-1">
                                                <a
                                                    href={application.candidate.profile.portfolioUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    View Portfolio →
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium text-muted-foreground">Success Rate:</span>
                                        <p className="text-foreground mt-1">{application.candidate.successRate}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {application.status !== 'REJECTED' && (
                                <Button
                                    onClick={() => handleStatusChange("REJECTED")}
                                    disabled={updateStatus.isPending}
                                    variant="outline"
                                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                                >
                                    <X className="h-4 w-4" />
                                    Reject Application
                                </Button>
                            )}
                            {application.status !== 'INTERVIEW' && application.status !== 'ACCEPTED' && (
                                <Button
                                    onClick={() => handleStatusChange("INTERVIEW")}
                                    disabled={updateStatus.isPending}
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Schedule Interview
                                </Button>
                            )}
                            {application.status !== 'ACCEPTED' && (
                                <Button
                                    onClick={() => handleStatusChange("ACCEPTED")}
                                    disabled={updateStatus.isPending}
                                    className="w-full justify-start gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Accept Application
                                </Button>
                            )}
                            {application.status === 'ACCEPTED' && (
                                <Button
                                    onClick={handleCreateContract}
                                    disabled={createContract.isPending}
                                    className="w-full justify-start gap-2"
                                >
                                    {createContract.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileText className="h-4 w-4" />
                                    )}
                                    Create Contract
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Feedback */}
                    {application.status === 'REJECTED' && (
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MessageSquare className="h-5 w-5" />
                                    Feedback
                                </CardTitle>
                                <CardDescription>
                                    Optional feedback for the candidate
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder="Share constructive feedback to help the candidate improve..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="min-h-[100px]"
                                />
                                <Button className="w-full mt-3" variant="outline">
                                    Send Feedback
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Application Stats */}
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Application Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Applied</span>
                                <span className="text-foreground">{new Date(application.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span className="text-foreground">{new Date(application.updatedAt).toLocaleDateString()}</span>
                            </div>
                            {application.score !== null && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">AI Score</span>
                                    <span className="text-foreground font-medium">{application.score}%</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
