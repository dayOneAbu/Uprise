
import { auth } from "~/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";
import { Textarea } from "~/app/_components/ui/textarea";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/candidate/auth/login");
  }

  const user = await api.user.me();

  async function updateProfile(_formData: FormData) {
    "use server";
    // In a real app, use a server action or TRPC mutation
    // For now we just redirect to check it works
    redirect("/candidate/profile");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your public profile details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" name="name" defaultValue={user.name ?? ""} />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={user.profile?.bio ?? ""} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input id="portfolio" name="portfolio" defaultValue={user.profile?.portfolioUrl ?? ""} />
            </div>

            <div className="pt-4">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>
            Manage your skills list.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
             <div className="flex flex-wrap gap-2">
                {user.profile?.skills?.split(',').map((skill, i) => (
                    <div key={i} className="bg-secondary px-3 py-1 rounded-full text-sm">
                        {skill.trim()}
                    </div>
                ))}
             </div>
             <p className="text-sm text-muted-foreground">
                To add new skills, take Skill Challenges from the dashboard.
             </p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
