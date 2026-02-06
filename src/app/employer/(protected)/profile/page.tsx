import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EmployerProfileForm } from "~/app/_components/employer/profile-form"; 

export default async function EmployerProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.companyId) {
    redirect("/employer/onboarding");
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Company Profile</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your company&apos;s public appearance.</p>
      </div>
      
      <EmployerProfileForm />
    </div>
  );
}
