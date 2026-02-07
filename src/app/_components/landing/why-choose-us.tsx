"use client";

import { ShieldCheck, Award, Zap, Shield, Users, Lock } from "lucide-react";

export function WhyChooseUs() {
  return (
    <div id="why-uprise" className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
           <div className="order-2 md:order-1 relative">
                <div className="bg-primary/5 rounded-3xl p-8 md:p-12">
                   <div className="aspect-[5/4] w-full flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
                        <div className="relative flex items-center justify-center w-32 h-32 bg-primary/20 rounded-2xl">
                          <Shield className="w-16 h-16 text-primary" />
                        </div>
                        <div className="absolute -top-4 -right-4 bg-background rounded-full p-2 shadow-lg">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="absolute -bottom-4 -left-4 bg-background rounded-full p-2 shadow-lg">
                          <Lock className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                   </div>
                </div>
           </div>
           
           <div className="order-1 md:order-2">
             <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why businesses choose Uprise
             </h2>
             
             <div className="space-y-8">
                <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Proof of Quality</h3>
                        <p className="text-muted-foreground">
                             Check any pro&apos;s work samples, client reviews, and identity verification.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                        <Award className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No Cost Until You Hire</h3>
                        <p className="text-muted-foreground">
                            Interview potential fits for your job, negotiate rates, and only pay for work you approve.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                        <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Safe and Secure</h3>
                        <p className="text-muted-foreground">
                            Focus on your work knowing we help protect your data and privacy. We&apos;re here with 24/7 support if you need it.
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
