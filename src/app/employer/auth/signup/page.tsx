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
                    MeritMatch provides a seamless platform to post jobs, review verified skills, and hire the best interns efficiently.
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
                <p className="text-muted-foreground mt-2">Join thousands of companies hiring on MeritMatch.</p>
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
