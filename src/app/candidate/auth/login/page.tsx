"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";

export default function CandidateLoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    await authClient.signIn.email(
      {
        email: normalizedEmail,
        password,
        callbackURL: "/candidate",
      },
      {
        onSuccess: () => {
          router.push("/candidate");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0d12] text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-[140px]" />
        <div className="absolute -bottom-52 -right-52 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_45%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
              Candidate Access
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl font-serif">
              Show proof. Get hired.
            </h1>
            <p className="text-lg text-slate-300 max-w-xl">
              Sign in to track applications, complete challenges, and surface your
              skills where it matters.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl font-semibold">60+</div>
                <div className="text-xs uppercase tracking-widest text-slate-400">Open challenges</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl font-semibold">24h</div>
                <div className="text-xs uppercase tracking-widest text-slate-400">Feedback loop</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Welcome back</h2>
              <p className="text-sm text-slate-400">Log in to your candidate dashboard.</p>
            </div>

            <form onSubmit={handleSignIn} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-slate-400">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="candidate@uprise.demo"
                  className="h-11 border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={isPasswordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 border-white/10 bg-white/5 pr-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/40"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    aria-label="Toggle password visibility"
                  >
                    {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white transition-transform hover:scale-[1.01]"
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <span className="flex items-center justify-center">
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="text-center text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <a className="text-cyan-300 hover:text-cyan-200" href="/candidate/auth/signup">
                  Create one
                </a>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
