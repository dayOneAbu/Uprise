import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EmployerSidebar } from "~/app/_components/employer/sidebar";

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
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <EmployerSidebar />
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
}
