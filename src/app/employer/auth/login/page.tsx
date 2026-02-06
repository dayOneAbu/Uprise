"use client";

import { useState } from "react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function EmployerLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await authClient.signIn.email({
        email,
        password,
        callbackURL: "/employer/jobs",
    }, {
        onSuccess: () => {
             router.push("/employer/jobs");
        },
        onError: (ctx) => {
            alert(ctx.error.message);
            setIsLoading(false);
        }
    });
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Visual (Same as Signup) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90" />
         <div className="relative z-10 p-12 text-white max-w-lg">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="h-16 w-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-blue-500/30">
                    <Globe className="h-8 w-8 text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold mb-6 leading-tight">Welcome Back.</h1>
                <p className="text-lg text-blue-100/80 mb-8">
                    Continue managing your talent pipeline and contracts with MeritMatch.
                </p>
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-1">Active</h3>
                        <p className="text-sm text-blue-200">Management</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-1">Secure</h3>
                        <p className="text-sm text-blue-200">Contracts</p>
                    </div>
                </div>
            </motion.div>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Employer Login</h2>
                <p className="text-gray-500 mt-2">Access your company dashboard.</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="jane@company.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>
                
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10" disabled={isLoading}>
                    {isLoading ? "Signing In..." : (
                        <>
                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <div className="text-center mt-6 text-sm">
                <span className="text-gray-500">Don&apos;t have an account? </span>
                <a href="/employer/auth/signup" className="text-blue-600 font-medium hover:underline">Sign up</a>
            </div>
        </div>
      </div>
    </div>
  );
}
