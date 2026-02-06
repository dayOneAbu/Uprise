"use client";

import { toast } from "sonner";
import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "~/lib/schemas";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/_components/ui/form";

type LoginFormData = z.infer<typeof loginSchema>;

export default function CandidateLoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/candidate",
    }, {
        onSuccess: () => {
             router.push("/candidate");
        },
        onError: (ctx) => {
            toast.error(ctx.error.message);
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
                <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mb-4">
                  🎓
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Candidate Login</h1>
                <p className="text-gray-500 text-sm mt-2">Access your internship dashboard</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input 
                            placeholder="you@example.com" 
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            {...field} 
                        />
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
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                            <Input
                                type={isPasswordVisible ? "text" : "password"}
                                placeholder="••••••••"
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors pr-10"
                                {...field}
                            />
                        </FormControl>
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        >
                            {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                             <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                            </>
                        ) : (
                            <>
                            Sign In <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>

                <div className="text-center mt-6 text-sm">
                  <span className="text-gray-500">Don&apos;t have an account? </span>
                  <a href="/candidate/auth/signup" className="text-amber-600 font-medium hover:underline">Sign up</a>
                </div>
              </form>
            </Form>
        </div>
      </motion.div>
    </div>
  );
}
