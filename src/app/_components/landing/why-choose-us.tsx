"use client";

import { ShieldCheck, Award, Zap } from "lucide-react";

export function WhyChooseUs() {
  return (
    <div id="why-meritmatch" className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
           <div className="order-2 md:order-1 relative">
                <div className="bg-indigo-50 rounded-3xl p-8 md:p-12">
                   <img 
                        src="/api/placeholder/500/400?text=Safe+Hiring" 
                        alt="Security illustration"
                        className="w-full h-auto mix-blend-multiply opacity-80"
                   />
                </div>
           </div>
           
           <div className="order-1 md:order-2">
             <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Why businesses choose MeritMatch
             </h2>
             
             <div className="space-y-8">
                <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                        <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Proof of Quality</h3>
                        <p className="text-slate-600">
                             Check any pro’s work samples, client reviews, and identity verification.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                        <Award className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Cost Until You Hire</h3>
                        <p className="text-slate-600">
                            Interview potential fits for your job, negotiate rates, and only pay for work you approve.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                        <Zap className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Safe and Secure</h3>
                        <p className="text-slate-600">
                            Focus on your work knowing we help protect your data and privacy. We’re here with 24/7 support if you need it.
                        </p>
                    </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
