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
import { ArrowRight } from "lucide-react";

type SignupFormData = z.infer<typeof signupSchema>;

export default function CandidateSignupPage() {
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        role: "CANDIDATE",
        callbackURL: "/candidate", // Candidate onboarding or dashboard
    } as any, {
        onSuccess: () => {
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl mb-4">
                🎓
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Candidate Signup</h1>
            <p className="text-gray-500 text-sm mt-2">Start your journey to success</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
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
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? "Creating Account..." : (
                  <>
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                  </>
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-6 text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <a href="/candidate/auth/login" className="text-indigo-600 font-medium hover:underline">Log in</a>
        </div>
      </div>
    </div>
  );
}
