import Link from "next/link";
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/candidate/auth/login");
  }

  // TODO: Check if user role is CANDIDATE

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="/candidate" className="font-bold text-xl text-indigo-600">MeritMatch Candidate</Link>
            <div className="space-x-4">
                <Link href="/candidate" className="hover:text-indigo-600">Dashboard</Link>
                <Link href="/candidate/applications" className="hover:text-indigo-600">Applications</Link>
            </div>
        </div>
      </nav>
      <main className="flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
