"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Label } from "~/app/_components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/app/_components/ui/select";
import { Plus, Trash2, Save, Code, Palette, FileText, Brain, Bug } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChallengeType } from "../../../../generated/prisma";

const challengeTypes: { value: ChallengeType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "CODE", label: "Code Challenge", icon: Code, description: "Write or debug code" },
  { value: "DESIGN", label: "Design Task", icon: Palette, description: "Create UI/UX designs" },
  { value: "WRITING", label: "Writing Assignment", icon: FileText, description: "Technical writing" },
  { value: "ANALYTICAL", label: "Analytical Problem", icon: Brain, description: "Data analysis & logic" },
  { value: "DEBUGGING", label: "Debug Exercise", icon: Bug, description: "Find and fix bugs" },
];

interface Task {
  title: string;
  description: string;
  rubric: string;
}

export function ChallengeCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ChallengeType>("CODE");
  const [timeLimit, setTimeLimit] = useState<string>("60");
  const [tasks, setTasks] = useState<Task[]>([{ title: "", description: "", rubric: "" }]);

  const createMutation = api.challenge.create.useMutation({
    onSuccess: (data) => {
      router.push(`/employer/challenges/${data.id}`);
    },
    onError: (error) => {
      alert(error.message);
      setIsSubmitting(false);
    },
  });

  const addTask = () => {
    setTasks([...tasks, { title: "", description: "", rubric: "" }]);
  };

  const removeTask = (index: number) => {
    if (tasks.length === 1) return;
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof Task, value: string) => {
    const newTasks = [...tasks];
    if (newTasks[index]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      newTasks[index][field] = value;
    }
    setTasks(newTasks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (tasks.some(t => !t.title.trim() || !t.description.trim())) {
      alert("Please fill in all task fields");
      return;
    }

    setIsSubmitting(true);
    
    createMutation.mutate({
      title,
      description,
      type,
      timeLimit: parseInt(timeLimit),
      tasks: tasks.map(t => ({
        title: t.title,
        description: t.description,
        rubric: t.rubric,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Challenge Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Build a React Checkout Component"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="type">Challenge Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as ChallengeType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {challengeTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <t.icon className="h-4 w-4" />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the challenge context, goals, and what candidates should demonstrate..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              min={5}
              max={180}
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 30-60 minutes for coding, 15-30 for writing tasks
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tasks ({tasks.length})</h3>
          <Button type="button" variant="outline" size="sm" onClick={addTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {tasks.map((task, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Task {index + 1}</CardTitle>
                {tasks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Task Title *</Label>
                <Input
                  placeholder="e.g., Implement the payment form"
                  value={task.title}
                  onChange={(e) => updateTask(index, "title", e.target.value)}
                />
              </div>
              <div>
                <Label>Task Description *</Label>
                <Textarea
                  placeholder="Detailed instructions for this specific task..."
                  rows={3}
                  value={task.description}
                  onChange={(e) => updateTask(index, "description", e.target.value)}
                />
              </div>
              <div>
                <Label>AI Grading Rubric (JSON)</Label>
                <Textarea
                  placeholder='{"criteria": ["Functionality", "Code Quality"], "weights": [60, 40]}'
                  rows={2}
                  value={task.rubric}
                  onChange={(e) => updateTask(index, "rubric", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Define how AI should grade this task
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2">
          <Save className="h-4 w-4" />
          {isSubmitting ? "Creating..." : "Create Challenge"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/employer/challenges")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
