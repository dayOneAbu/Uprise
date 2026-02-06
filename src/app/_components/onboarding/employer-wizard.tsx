"use client";

import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Label } from "~/app/_components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2, Building2 } from "lucide-react";
import { slugify } from "~/lib/utils";
import { useOnboardingStore } from "~/stores/onboarding-store";

const STEPS = [
  { id: 1, title: "Company Details", description: "Basic information about your company" },
  { id: 2, title: "Branding", description: "How you appear to candidates" },
];

export function EmployerWizard() {
  const router = useRouter();
  const { employer, setEmployerData, reset } = useOnboardingStore();
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  const createCompany = api.company.create.useMutation({
    onSuccess: () => {
      reset();
      router.push("/employer/jobs");
      router.refresh();
    },
    onError: (err) => {
        toast.error("Error creating company: " + err.message);
    }
  });

  const handleNext = () => {
    if (employer.step < STEPS.length) {
      setEmployerData({ step: employer.step + 1 });
    } else {
      // Submit
      createCompany.mutate({
        name: employer.name,
        slug: employer.slug,
        website: employer.website || undefined,
        description: employer.description || undefined,
        logoUrl: employer.logoUrl || undefined,
      });
    }
  };

  const handleBack = () => {
    if (employer.step > 1) {
      setEmployerData({ step: employer.step - 1 });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Auto-generate slug from name if slug hasn't been manually edited or matches previous auto-gen
    const generatedSlug = slugify(name);
    // Simple heuristic: if slug is empty or equals slugified version of OLD name, update it.
    // Since we don't have old name easily, we just check if slug is empty or matches current (before update).
    // Actually, store updates are instant. Let's just update if slug is empty.
    // Or if previous slug was derived from previous name.
    
    // Simplification: update if slug is empty or looks like a slug.
    setEmployerData({ 
        name, 
        slug: employer.slug === "" || employer.slug === slugify(employer.name) ? generatedSlug : employer.slug 
    });
  };

  if (!mounted) return null;

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2" />
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center bg-white px-2">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                employer.step >= s.id 
                  ? "bg-amber-600 text-white" 
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {employer.step > s.id ? <CheckCircle2 size={20} /> : s.id}
            </div>
            <span className={`text-xs font-medium ${employer.step >= s.id ? "text-amber-900" : "text-slate-400"}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-slate-200 shadow-xl">
        <CardHeader>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 text-amber-600">
                <Building2 size={24} />
            </div>
          <CardTitle className="text-2xl">{STEPS[employer.step - 1]?.title}</CardTitle>
          <CardDescription>{STEPS[employer.step - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* STEP 1: Company Details */}
          {employer.step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input 
                  id="name" 
                  placeholder="Acme Corp"
                  value={employer.name}
                  onChange={handleNameChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Company Handle (Slug)</Label>
                <div className="flex items-center">
                    <span className="bg-slate-100 border border-r-0 border-input rounded-l-md px-3 py-2 text-slate-500 text-sm">meritmatch.com/c/</span>
                    <Input 
                    id="slug" 
                    placeholder="acme-corp"
                    className="rounded-l-none"
                    value={employer.slug}
                    onChange={(e) => setEmployerData({ slug: e.target.value })}
                    />
                </div>
                <p className="text-xs text-slate-500">Unique identifier for your company profile URL.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  placeholder="https://acme.com"
                  value={employer.website}
                  onChange={(e) => setEmployerData({ website: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Branding */}
          {employer.step === 2 && (
             <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">About the Company</Label>
                <Textarea 
                  id="description" 
                  placeholder="What does your company do? What is your mission?"
                  className="min-h-30"
                  value={employer.description}
                  onChange={(e) => setEmployerData({ description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input 
                  id="logoUrl" 
                  placeholder="https://..."
                  value={employer.logoUrl}
                  onChange={(e) => setEmployerData({ logoUrl: e.target.value })}
                />
                <p className="text-xs text-slate-500">Link to your company logo image.</p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-slate-100 mt-6">
            <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={employer.step === 1 || createCompany.isPending}
                className="text-slate-500"
            >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button 
                onClick={handleNext} 
                className="bg-amber-600 hover:bg-amber-700 min-w-30"
                disabled={createCompany.isPending || (employer.step === 1 && (!employer.name || !employer.slug))}
            >
                {createCompany.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : employer.step === STEPS.length ? (
                    "Create Company"
                ) : (
                    <>Next <ChevronRight className="ml-2 h-4 w-4" /></>
                )}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
