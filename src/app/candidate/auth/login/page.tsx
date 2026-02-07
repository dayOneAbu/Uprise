"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils"; // Assuming utils exists from shadcn

// Reusing Custom Input Component pattern
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export default function CandidateLoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await authClient.signIn.email({
        email,
        password,
        callbackURL: "/candidate", // Redirect to candidate dashboard
    }, {
        onRequest: () => {
             // Optional: show loading
        },
        onSuccess: () => {
             // router.push("/candidate"); handled by callbackURL usually but better explicit
             router.push("/candidate");
        },
        onError: (ctx) => {
            alert(ctx.error.message);
            setIsLoading(false);
        }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="p-8">
            <div className="text-center mb-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl mb-4">
                  🎓
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Candidate Login</h1>
                <p className="text-gray-500 text-sm mt-2">Access your internship dashboard</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <Input
                            type={isPasswordVisible ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors pr-10"
                            placeholder="••••••••"
                        />
                         <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        >
                            {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing in..." : (
                            <>
                            Sign In <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>

                <div className="text-center mt-6 text-sm">
                  <span className="text-gray-500">Don&apos;t have an account? </span>
                  <a href="/candidate/auth/signup" className="text-indigo-600 font-medium hover:underline">Sign up</a>
                </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
}
