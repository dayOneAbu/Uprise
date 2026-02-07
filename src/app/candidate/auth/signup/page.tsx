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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        role: "CANDIDATE",
        callbackURL: "/candidate", // Candidate onboarding or dashboard
    } as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
        onSuccess: () => {
             router.push("/candidate");
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
        callbackURL: "/candidate/onboarding",
    }, {
        onError: (ctx) => {
            toast.error(ctx.error.message);
            setIsLoading(false);
        }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mb-4">
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
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
              {isLoading ? "Creating Account..." : (
                  <>
                  Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                  </>
              )}
            </Button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center border-gray-200 hover:bg-gray-50 transition-all font-medium py-2.5 rounded-lg"
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
            <span className="text-gray-500">Already have an account? </span>
            <a href="/candidate/auth/login" className="text-amber-600 font-medium hover:underline">Log in</a>
        </div>
      </div>
    </div>
  );
}
