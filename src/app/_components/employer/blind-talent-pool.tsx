"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Progress } from "~/app/_components/ui/progress";
import { Eye, EyeOff, Target, Award, Search, Filter } from "lucide-react";

interface BlindCandidate {
  id: string;
  maskedId: string;
  skillScores: {
    id: string;
    skill: string;
    score: number;
    submissions: number;
  }[];
  totalSubmissions: number;
  completedSubmissions: number;
  averageScore: number;
  identityRevealed?: boolean;
}

export function BlindTalentPool() {
  // Get current employer's company
  const { data: me } = api.user.me.useQuery();
  const companyId = me?.company?.id ?? "";
  
  const { data: candidates, isLoading } = api.user.getTopCandidates.useQuery(
    {
      companyId,
      limit: 50,
    },
    {
      enabled: !!companyId, // Only fetch when we have the company ID
    }
  );
  
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(60);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Extract all unique skills from candidates
  const allSkills = candidates?.reduce((acc: string[], c) => {
    c.skillScores?.forEach((s: { skill: string }) => {
      if (!acc.includes(s.skill)) acc.push(s.skill);
    });
    return acc;
  }, []) ?? [];

  // Filter candidates
  const filteredCandidates = candidates?.filter((c: BlindCandidate) => {
    // Score filter
    if (c.averageScore < minScore) return false;
    
    // Skill filter
    if (selectedSkills.length > 0) {
      const candidateSkills = c.skillScores?.map((s: { skill: string }) => s.skill) ?? [];
      if (!selectedSkills.some(s => candidateSkills.includes(s))) return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const hasMatchingSkill = c.skillScores?.some((s: { skill: string }) => 
        s.skill.toLowerCase().includes(query)
      );
      if (!hasMatchingSkill) return false;
    }
    
    return true;
  }) ?? [];

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-64" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Min Score:</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
              </div>
            </div>
          </div>
          
          {/* Skill filters */}
          {allSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {allSkills.slice(0, 10).map((skill: string) => (
                <button
                  key={skill}
                  onClick={() => toggleSkillFilter(skill)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
      </p>

      {/* Candidates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCandidates.map((candidate: BlindCandidate) => {
          const isRevealed = revealedIds.has(candidate.id);
          const topSkills = candidate.skillScores?.slice(0, 4) ?? [];
          
          return (
            <Card key={candidate.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {isRevealed ? (
                        <span>Candidate #{candidate.maskedId}</span>
                      ) : (
                        <span className="blur-sm">Candidate #{candidate.maskedId}</span>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Award className="h-3 w-3" />
                      {candidate.totalSubmissions} challenge{candidate.totalSubmissions !== 1 ? 's' : ''} completed
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleReveal(candidate.id)}
                    title={isRevealed ? "Hide identity" : "Reveal identity"}
                  >
                    {isRevealed ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Overall Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      candidate.averageScore >= 80 ? 'text-green-600' :
                      candidate.averageScore >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {candidate.averageScore}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={candidate.averageScore} 
                  className={`h-2 ${
                    candidate.averageScore >= 80 ? 'bg-green-100' :
                    candidate.averageScore >= 60 ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}
                />

                {/* Top Skills */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-3 w-3" />
                    Top Skills
                  </div>
                  <div className="space-y-2">
                    {topSkills.map((skill: { id: string; skill: string; score: number }) => (
                      <div key={skill.id} className="flex items-center justify-between text-sm">
                        <span>{skill.skill}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={skill.score} className="w-20 h-1.5" />
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {skill.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    disabled={!isRevealed}
                  >
                    View Profile
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    disabled={!isRevealed}
                  >
                    Contact
                  </Button>
                </div>
                
                {!isRevealed && (
                  <p className="text-xs text-center text-muted-foreground">
                    Reveal identity to view full profile and contact
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCandidates.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No candidates match your criteria. Try adjusting filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
