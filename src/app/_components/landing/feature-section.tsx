"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "~/app/_components/ui/button";

export function FeatureSection() {
  return (
    <div id="enterprise" className="bg-muted py-16 md:py-24 text-foreground rounded-t-[3rem] -mt-8 relative z-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-primary font-semibold mb-2 tracking-wide uppercase text-sm">
              For Enterprise
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Scale your workforce with <br />
              <span className="text-primary">verified talent</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Access the top 1% of interns on Uprise. We verify skills,
              track academic performance, and ensure readiness for real-world projects.
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-primary" />
                <span className="text-foreground">Pre-vetted candidates with proven skills</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-primary" />
                <span className="text-foreground">Consolidated billing & payroll compliance</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-primary" />
                <span className="text-foreground">Dedicated account management support</span>
              </li>
            </ul>

            <Button className="rounded-full py-6 px-8 text-base font-semibold">
              Learn about Enterprise Solutions
            </Button>
          </div>
          
          <div className="bg-card p-8 rounded-3xl border border-border backdrop-blur-sm">
             {/* Mock UI for "Talent Insights" */}
             <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">Skill verification</span>
                    <span className="text-primary text-sm font-medium">Verified</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-primary rounded-full"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Python</span>
                    <span>92% Score</span>
                </div>
             </div>
             
             <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">Project Completion</span>
                    <span className="text-primary text-sm font-medium">Top 5%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-primary rounded-full"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>On-time delivery</span>
                    <span>98% Rate</span>
                </div>
             </div>

             <div className="bg-muted p-4 rounded-xl border border-border flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">
                    A+
                </div>
                <div>
                     <div className="text-foreground font-medium">Merit Score</div>
                     <div className="text-xs text-muted-foreground">Calculated based on 15+ metrics</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
