"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Label } from "~/app/_components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Loader2 } from "lucide-react";

export function EmployerProfileForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
        name: "",
        slug: "",
        website: "",
        description: "",
        logoUrl: "",
        id: "",
    });
  
  // Fetch my company
  const { data: company, isLoading, refetch } = api.company.getMine.useQuery();
  
  // Mutation
  const updateCompany = api.company.update.useMutation({
      onSuccess: () => {
          router.refresh();
          void refetch();
          alert("Company profile updated successfully!");
      },
      onError: (err) => {
          alert("Error updating profile: " + err.message);
      }
  });

  useEffect(() => {
      if (company) {
          setFormData({
              name: company.name,
              slug: company.slug,
              website: company.website ?? "",
              description: company.description ?? "",
              logoUrl: company.logoUrl ?? "",
              id: company.id,
          });
      }
  }, [company]);

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading company details...</div>
    }

    if (!company) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-red-500">Company not found. Please contact support.</p>
                </CardContent>
            </Card>
        )
    }

    const handleSubmit = () => {
        updateCompany.mutate({
            id: formData.id,
            name: formData.name,
            slug: formData.slug,
            website: formData.website || undefined,
            description: formData.description || undefined,
            logoUrl: formData.logoUrl || undefined,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Company Details</CardTitle>
                <CardDescription>Update your public company profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Company Handle</Label>
                    <div className="flex items-center">
                        <span className="bg-slate-100 border border-r-0 border-input rounded-l-md px-3 py-2 text-slate-500 text-sm">meritmatch.com/c/</span>
                        <Input 
                        id="slug" 
                        value={formData.slug}
                        className="rounded-l-none"
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">About the Company</Label>
                    <Textarea 
                      id="description" 
                      className="min-h-30"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input 
                      id="logoUrl" 
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button 
                        onClick={handleSubmit} 
                        disabled={updateCompany.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {updateCompany.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
