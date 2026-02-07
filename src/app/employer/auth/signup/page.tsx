"use client";

import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "~/lib/schemas";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";
import { ArrowRight, Globe } from "lucide-react";
import { motion } from "framer-motion";

type SignupFormData = z.infer<typeof signupSchema>;

export default function EmployerSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await authClient.signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
                role: "EMPLOYER",
                callbackURL: "/employer/jobs",
            } as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
        onSuccess: () => {
             router.push("/employer/jobs");
        },
        onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
        }
    });
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    await authClient.signIn.social({
        provider: "google",
        callbackURL: "/employer/onboarding",
    }, {
        onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
        }
    });
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-slate-900 opacity-90" />
         <div className="relative z-10 p-12 text-white max-w-lg">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="h-16 w-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-amber-500/30">
                    <Globe className="h-8 w-8 text-amber-400" />
                </div>
                <h1 className="text-4xl font-bold mb-6 leading-tight">Connect with Top Tier Talent from Around the Globe.</h1>
                 <p className="text-lg text-amber-100/80 mb-8">
                    Uprise provides a seamless platform to post jobs, review verified skills, and hire the best interns efficiently.
                </p>
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-1">500+</h3>
                        <p className="text-sm text-amber-200">Verified Interns</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-1">98%</h3>
                        <p className="text-sm text-amber-200">Match Success</p>
                    </div>
                </div>
            </motion.div>
         </div>
         {/* Abstract shapes can go here */}
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-sm border border-border">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Create Employer Account</h2>
                <p className="text-muted-foreground mt-2">Join thousands of companies hiring on Uprise.</p>
            </div>

            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Company Representative Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Work Email</FormLabel>
                    <FormControl>
                        <Input placeholder="jane@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full h-10" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : (
                        <>
                        Create Account <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center border-border hover:bg-muted transition-all font-medium py-2.5 rounded-lg"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                >
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Google
                </Button>
            </form>
            </Form>

            <div className="text-center mt-6 text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <a href="/employer/auth/login" className="text-primary font-medium hover:underline">Log in</a>
            </div>
        </div>
      </div>
    </div>
  );
}
