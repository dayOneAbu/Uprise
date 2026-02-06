import Link from "next/link";
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/employer/auth/login");
  }

  if (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN") {
      redirect("/");
  }

  // Force onboarding if no company
  if (!session.user.companyId && session.user.role === "EMPLOYER") {
       redirect("/employer/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full bg-slate-900 text-slate-100 md:w-64">
        <div className="p-4">
          <h2 className="text-xl font-bold">Employer Portal</h2>
        </div>
        <nav className="flex flex-col gap-2 p-2">
          <Link
            href="/employer/jobs"
            className="rounded p-2 hover:bg-slate-800"
          >
            My Jobs
          </Link>
          <Link
            href="/employer/contracts"
            className="rounded p-2 hover:bg-slate-800"
          >
            Contracts
          </Link>
          <Link
            href="/employer/profile"
            className="rounded p-2 hover:bg-slate-800"
          >
            Company Profile
          </Link>
        </nav>
      </aside>
      <main className="flex-1 bg-slate-50 p-6 text-slate-900">
        {children}
      </main>
    </div>
  );
}
