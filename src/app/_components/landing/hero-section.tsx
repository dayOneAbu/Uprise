"use client";

import { Button } from "~/app/_components/ui/button";
import Link from "next/link";

interface HeroSectionProps {
  session: {
    user: {
      role?: string;
    };
  } | null;
}

export function HeroSection({ session }: HeroSectionProps) {

  return (
    <div className="relative overflow-hidden bg-white pb-16 pt-8 md:pb-24 lg:pb-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 md:text-6xl lg:text-7xl leading-[1.1]">
              Connecting <br />
              <span className="text-blue-600">businesses</span> with <br />
              ambitious <span className="text-indigo-600">interns</span>
            </h1>
              <p className="text-xl text-slate-600 max-w-150 leading-relaxed">
              The merit-based platform for finding verified talent. Post a role, review blind applications, and hire the best.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
               {session ? (
                  <>
                    {session.user.role === "EMPLOYER" && (
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl" asChild>
                            <Link href="/employer/jobs">Go to Employer Dashboard</Link>
                        </Button>
                    )}
                    {session.user.role === "CANDIDATE" && (
                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 rounded-xl" asChild>
                            <Link href="/candidate">Go to Candidate Dashboard</Link>
                        </Button>
                    )}
                    {session.user.role === "ADMIN" && (
                       <Button size="lg" className="bg-slate-800 hover:bg-slate-900 text-lg px-8 py-6 rounded-xl" asChild>
                          <Link href="/admin">Go to Admin Dashboard</Link>
                       </Button>
                    )}
                  </>
               ) : (
                  <>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl" asChild>
                        <Link href="/employer/auth/login">Find Talent</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50" asChild>
                        <Link href="/candidate/auth/login">Find Internships</Link>
                    </Button>
                  </>
               )}
            </div>

            <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
              <span>Trusted by:</span>
              <div className="flex gap-4 grayscale opacity-60">
                {/* Placeholders for logos */}
                <span className="font-bold text-lg">TechCorp</span>
                <span className="font-bold text-lg">InnovateLabs</span>
                <span className="font-bold text-lg">FutureSystems</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            {/* Abstract Background Shapes */}
            <div className="absolute -top-12 -right-12 h-125 w-125 rounded-full bg-blue-50/50 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-100 w-100 rounded-full bg-indigo-50/50 blur-3xl" />
            
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
                <img 
                    src="/hero_image.png" 
                    alt="Intern working deeply"
                    className="w-full h-auto object-cover" 
                    style={{ aspectRatio: "6/5" }}
                />
                 {/* Floating Card Element */}
                 <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl">
                            98%
                        </div>
                        <div>
                            <div className="font-bold text-slate-900">Success Rate</div>
                            <div className="text-sm text-slate-500">For matched internships</div>
                        </div>
                    </div>
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
