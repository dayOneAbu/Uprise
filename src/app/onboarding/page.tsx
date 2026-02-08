"use client";

import { toast } from "sonner";

import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { UserRole } from "~/generated/prisma";

export default function OnboardingPage() {
  const router = useRouter();
  // Using Mutation to set role
  const setRole = api.user.setRole.useMutation({
    onSuccess: (data) => {
       // Redirect based on selected role
       if (data.role === UserRole.EMPLOYER) {
           router.push("/employer/jobs");
       } else if (data.role === UserRole.CANDIDATE) {
           router.push("/candidate");
       } else {
           router.push("/");
       }
       router.refresh();
    },
    onError: (err) => {
        toast.error("Failed to set role: " + err.message);
    }
  });

  const handleSelectRole = (role: "CANDIDATE" | "EMPLOYER") => {
    // We cast string to enum if needed, or better, use the enum.
    // However, client side enum usage requires importing it or values match string.
    // UserRole is imported.
    const roleEnum = role === "CANDIDATE" ? UserRole.CANDIDATE : UserRole.EMPLOYER;
    setRole.mutate({ role: roleEnum });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to UPrise!</h1>
        <p className="text-xl text-gray-600 mb-10">To get started, please tell us how you want to use the platform.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => handleSelectRole("CANDIDATE")}
            disabled={setRole.isPending}
             className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-md border hover:border-indigo-400 hover:shadow-xl transition"
          >
            <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mb-4">
              🎓
            </div>
            <h2 className="text-2xl font-bold mb-2">I&apos;m a Candidate</h2>
            <p className="text-gray-500 text-sm">I want to find internships and build my career.</p>
          </button>

          <button
            onClick={() => handleSelectRole("EMPLOYER")}
             disabled={setRole.isPending}
             className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-md border hover:border-blue-400 hover:shadow-xl transition"
          >
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4">
              💼
            </div>
             <h2 className="text-2xl font-bold mb-2">I&apos;m an Employer</h2>
             <p className="text-gray-500 text-sm">I want to hire talented interns for my company.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
