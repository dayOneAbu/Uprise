"use client";

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
import { ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

type SignupFormData = z.infer<typeof signupSchema>;

export default function AdminSignupPage() {
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
    await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: "/admin", 
    }, {
        onSuccess: () => {
             router.push("/admin");
        },
        onError: (ctx) => {
            alert(ctx.error.message);
            setIsLoading(false);
        }
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-zinc-950">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden border-r border-zinc-800">
         <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black opacity-90" />
         <div className="relative z-10 p-12 text-white max-w-lg text-center">
             <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex h-24 w-24 rounded-full bg-red-500/10 items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
             >
                 <ShieldAlert className="h-10 w-10 text-red-500" />
             </motion.div>
             <h1 className="text-3xl font-bold mb-4 tracking-tight">Restricted Access</h1>
             <p className="text-red-200/60">System Administration Registration.</p>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-950 text-white">
        <div className="w-full max-w-md bg-zinc-900/50 p-8 rounded-2xl shadow-2xl border border-zinc-800">
            <div className="mb-8 border-l-4 border-red-600 pl-4">
                <h2 className="text-2xl font-bold">Register Admin</h2>
                <p className="text-zinc-500 mt-1 text-sm">Authorized personnel only.</p>
            </div>

            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-zinc-400">Admin Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Admin User" {...field} className="bg-zinc-900 border-zinc-700 text-white focus:border-red-500/50 placeholder:text-zinc-600" />
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
                    <FormLabel className="text-zinc-400">System Email</FormLabel>
                    <FormControl>
                        <Input placeholder="admin@system.internal" {...field} className="bg-zinc-900 border-zinc-700 text-white focus:border-red-500/50 placeholder:text-zinc-600" />
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
                    <FormLabel className="text-zinc-400">Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-zinc-900 border-zinc-700 text-white focus:border-red-500/50 placeholder:text-zinc-600" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border border-red-500/20" disabled={isLoading}>
                    {isLoading ? "Validating..." : "Register System Access"}
                </Button>
            </form>
            </Form>

            <div className="text-center mt-6 text-sm">
                <a href="/admin/auth/login" className="text-red-400 hover:text-red-300 transition-colors">Return to Login</a>
            </div>
        </div>
      </div>
    </div>
  );
}
