import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CandidateSidebar } from "~/app/_components/candidate/sidebar";

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

  if (session.user.role !== "CANDIDATE" && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <CandidateSidebar />
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
}
