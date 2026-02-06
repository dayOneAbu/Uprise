"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "~/app/_components/ui/button";

export function FeatureSection() {
  return (
    <div id="enterprise" className="bg-slate-900 py-16 md:py-24 text-white rounded-t-[3rem] -mt-8 relative z-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-indigo-400 font-semibold mb-2 tracking-wide uppercase text-sm">
              For Enterprise
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Scale your workforce with <br />
              <span className="text-blue-400">verified talent</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Access the top 1% of interns on MeritMatch. We verify skills,
              track academic performance, and ensure readiness for real-world projects.
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-blue-400" />
                <span className="text-slate-200">Pre-vetted candidates with proven skills</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-blue-400" />
                <span className="text-slate-200">Consolidated billing & payroll compliance</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-blue-400" />
                <span className="text-slate-200">Dedicated account management support</span>
              </li>
            </ul>

            <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full py-6 px-8 text-base font-semibold">
              Learn about Enterprise Solutions
            </Button>
          </div>
          
          <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
             {/* Mock UI for "Talent Insights" */}
             <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-400">Skill verification</span>
                    <span className="text-green-400 text-sm font-medium">Verified</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-linear-to-r from-blue-500 to-indigo-500"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>Python</span>
                    <span>92% Score</span>
                </div>
             </div>
             
             <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-400">Project Completion</span>
                    <span className="text-green-400 text-sm font-medium">Top 5%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-linear-to-r from-blue-500 to-indigo-500"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>On-time delivery</span>
                    <span>98% Rate</span>
                </div>
             </div>

             <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                <div className="h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold">
                    A+
                </div>
                <div>
                     <div className="text-slate-200 font-medium">Merit Score</div>
                     <div className="text-xs text-slate-400">Calculated based on 15+ metrics</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
