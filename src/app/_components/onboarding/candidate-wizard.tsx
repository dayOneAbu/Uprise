"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Label } from "~/app/_components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Badge } from "~/app/_components/ui/badge";
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { useOnboardingStore } from "~/stores/onboarding-store";

const STEPS = [
  { id: 1, title: "Basic Info", description: "Tell us about yourself" },
  { id: 2, title: "Skills", description: "What are you good at?" },
  { id: 3, title: "Portfolio", description: "Showcase your work" },
];

const SUGGESTED_SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "Java", "Design", "Figma", 
  "Marketing", "Writing", "Data Analysis", "SQL", "Git"
];

export function CandidateWizard() {
  const router = useRouter();
  const { candidate, setCandidateData, reset } = useOnboardingStore();
  const [mounted, setMounted] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  const updateProfile = api.profile.update.useMutation({
    onSuccess: () => {
      // Clear store on success
      reset();
      router.push("/candidate");
      router.refresh();
    },
  });

  const handleNext = () => {
    if (candidate.step < STEPS.length) {
      setCandidateData({ step: candidate.step + 1 });
    } else {
      // Submit
      updateProfile.mutate({
        bio: candidate.bio,
        location: candidate.location,
        skills: candidate.skills.join(", "),
        portfolioUrl: candidate.portfolioUrl || undefined,
      });
    }
  };

  const handleBack = () => {
    if (candidate.step > 1) {
      setCandidateData({ step: candidate.step - 1 });
    }
  };

  const toggleSkill = (skill: string) => {
    if (candidate.skills.includes(skill)) {
      setCandidateData({ skills: candidate.skills.filter(s => s !== skill) });
    } else {
      setCandidateData({ skills: [...candidate.skills, skill] });
    }
  };

  const addCustomSkill = () => {
    if (customSkill && !candidate.skills.includes(customSkill)) {
      setCandidateData({ skills: [...candidate.skills, customSkill] });
      setCustomSkill("");
    }
  };

  // Avoid hydration mismatch by waiting for mount
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
                candidate.step >= s.id 
                  ? "bg-indigo-600 text-white" 
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {candidate.step > s.id ? <CheckCircle2 size={20} /> : s.id}
            </div>
            <span className={`text-xs font-medium ${candidate.step >= s.id ? "text-indigo-900" : "text-slate-400"}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-slate-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{STEPS[candidate.step - 1]?.title}</CardTitle>
          <CardDescription>{STEPS[candidate.step - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* STEP 1: Basic Info */}
          {candidate.step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Where are you based?</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. New York, Remote, London"
                  value={candidate.location}
                  onChange={(e) => setCandidateData({ location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Short Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell employers a bit about yourself, your interests, and what you're looking for..."
                  className="min-h-30"
                  value={candidate.bio}
                  onChange={(e) => setCandidateData({ bio: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Skills */}
          {candidate.step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Select your top skills</Label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.map(skill => (
                    <Badge 
                      key={skill}
                      variant="outline" 
                      className={`cursor-pointer px-3 py-2 text-sm transition-all ${
                        candidate.skills.includes(skill)
                          ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" 
                          : "hover:border-indigo-400 hover:text-indigo-600"
                      }`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Add other skills</Label>
                <div className="flex gap-2">
                    <Input 
                        placeholder="e.g. Vue.js"
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                    />
                    <Button type="button" onClick={addCustomSkill} variant="secondary">Add</Button>
                </div>
              </div>

              {candidate.skills.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <Label className="mb-2 block text-xs uppercase tracking-wider text-slate-500">Selected Skills</Label>
                      <div className="flex flex-wrap gap-2">
                          {candidate.skills.map(skill => (
                              <Badge key={skill} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0 flex items-center gap-1">
                                  {skill}
                                  <button onClick={() => toggleSkill(skill)} className="hover:text-red-500 ml-1">×</button>
                              </Badge>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          )}

          {/* STEP 3: Portfolio */}
          {candidate.step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio URL / LinkedIn / GitHub</Label>
                <Input 
                  id="portfolio" 
                  placeholder="https://..."
                  value={candidate.portfolioUrl}
                  onChange={(e) => setCandidateData({ portfolioUrl: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                    Share a link to your work or professional profile to stand out.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-slate-100 mt-6">
            <Button 
                variant="ghost" 
                onClick={handleBack} 
                disabled={candidate.step === 1 || updateProfile.isPending}
                className="text-slate-500"
            >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button 
                onClick={handleNext} 
                className="bg-indigo-600 hover:bg-indigo-700 min-w-30"
                disabled={updateProfile.isPending || (candidate.step === 1 && (!candidate.location || !candidate.bio))}
            >
                {updateProfile.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : candidate.step === STEPS.length ? (
                    "Complete Profile"
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
