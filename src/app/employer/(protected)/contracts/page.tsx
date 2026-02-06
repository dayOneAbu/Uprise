import { api, HydrateClient } from "~/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { Button } from "~/app/_components/ui/button";
import { FileText, Calendar, User, CheckCircle, X, Eye, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/app/_components/ui/dropdown-menu";
import Link from "next/link";

export default async function ContractsPage() {
  const contracts = await api.contract.listMyContracts();

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "ACTIVE": return "default";
      case "COMPLETED": return "secondary";
      case "TERMINATED": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="h-3 w-3" />;
      case "TERMINATED": return <X className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Contracts</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage your active and completed internship contracts
            </p>
          </div>
          <Button variant="outline" className="gap-2" disabled>
            <FileText className="h-4 w-4" />
            Export Contracts
          </Button>
        </div>

        {contracts.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No contracts found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Contracts will appear here once you hire candidates
              </p>
              <Button asChild>
                <Link href="/employer/applications">View Applications</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract) => (
              <Card key={contract.id} className="border-border/50 hover:border-border transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {contract.job?.title ?? "Unknown Job"}
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>
                            Intern: <span className="font-medium text-foreground">
                              {contract.intern?.name ?? "Unknown Intern"}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Started: {contract.startDate?.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {contract.endDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {contract.status === "COMPLETED" ? "Completed" : "Terminated"}: {contract.endDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(contract.status)} className="text-sm gap-1">
                        {getStatusIcon(contract.status)}
                        {contract.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Contract Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/employer/contracts/${contract.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {contract.status === "ACTIVE" && (
                            <>
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <X className="h-4 w-4 mr-2" />
                                Terminate Contract
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                {contract.feedback && (
                  <CardContent>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-foreground italic">
                        "{contract.feedback}"
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </HydrateClient>
  );
}
