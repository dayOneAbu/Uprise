"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Loader2
} from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Badge } from "~/app/_components/ui/badge";
import { Card, CardContent } from "~/app/_components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import { api } from "~/trpc/react";

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch all applications for the employer's company jobs
  const { data: applications, isLoading } = api.application.listMyApplications.useQuery();

  const filteredApplications = applications?.filter((app) => {
    const matchesSearch = app.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) ?? [];


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OFFER": return <CheckCircle size={14} className="mr-1" />;
      case "REJECTED": return <XCircle size={14} className="mr-1" />;
      case "PENDING": return <Clock size={14} className="mr-1" />;
      case "REVIEWING": return <FileText size={14} className="mr-1" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "OFFER": return "default";
      case "REJECTED": return "destructive";
      case "PENDING": return "secondary";
      case "REVIEWING": return "outline";
      case "INTERVIEW": return "outline";
      default: return "outline";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-primary";
    if (score >= 75) return "bg-primary/70";
    return "bg-primary/50";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Applications</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage and track candidate applications across all your job postings
          </p>
        </div>
        <Button variant="outline" className="gap-2" disabled>
            <Download size={16} />
            Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search candidates or roles..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full sm:w-auto">
                    <Filter size={16} />
                    Filter Status: {statusFilter === 'ALL' ? 'All' : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>All Applications</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("REVIEWING")}>Reviewing</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("INTERVIEW")}>Interview</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("OFFER")}>Offer Sent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("REJECTED")}>Rejected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-muted-foreground font-medium">Candidate</th>
                <th className="px-6 py-4 text-muted-foreground font-medium">Role applied for</th>
                <th className="px-6 py-4 text-muted-foreground font-medium">Date</th>
                <th className="px-6 py-4 text-muted-foreground font-medium">Match Score</th>
                <th className="px-6 py-4 text-muted-foreground font-medium">Status</th>
                <th className="px-6 py-4 text-right text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredApplications.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No applications found matching your filters.
                    </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {app.candidate?.name ? app.candidate.name.split(' ').map(n => n[0]).join('') : "??"}
                        </div>
                        <div>
                            <div className="font-semibold text-foreground">{app.candidate?.name ?? "Unknown Candidate"}</div>
                            <div className="text-xs text-muted-foreground">{app.candidate?.email ?? ""}</div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-foreground font-medium">
                        {app.job?.title ?? "Unknown Job"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                        {app.score !== null ? (
                          <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                      className={`h-full rounded-full ${getScoreColor(app.score)}`}
                                      style={{ width: `${app.score}%` }}
                                  />
                              </div>
                              <span className="text-xs font-medium text-foreground">{app.score}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not graded</span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(app.status)} className="font-medium">
                            {getStatusIcon(app.status)}
                            {app.status}
                        </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-foreground">
                                    <MoreHorizontal size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`/employer/applications/${app.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Waitlist</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Reject Application</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filteredApplications.length} applications</span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled className="h-8">Previous</Button>
                <Button variant="outline" size="sm" disabled className="h-8">Next</Button>
            </div>
        </div>
      </Card>
    </div>
  );
}
