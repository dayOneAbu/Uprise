"use client";

import { Code, PenTool, BarChart3, Megaphone, Stethoscope, Gavel, Building2, Wrench } from "lucide-react";
import { Card } from "~/app/_components/ui/card";
import Link from "next/link";

const categories = [
  { name: "Engineering & IT", icon: Code, count: "1.2k+ jobs" },
  { name: "Creative & Design", icon: PenTool, count: "800+ jobs" },
  { name: "Data Science", icon: BarChart3, count: "500+ jobs" },
  { name: "Marketing", icon: Megaphone, count: "900+ jobs" },
  { name: "Healthcare", icon: Stethoscope, count: "300+ jobs" },
  { name: "Legal", icon: Gavel, count: "200+ jobs" },
  { name: "Finance", icon: Building2, count: "600+ jobs" },
  { name: "Engineering", icon: Wrench, count: "400+ jobs" },
];

export function CategoryGrid() {
  return (
    <div className="py-16 md:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-8 md:mb-12">
          Explore internships by category
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link href={`/search?category=${category.name}`} key={category.name}>
                <Card className="p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer group h-full border-border/50">
                <div className="mb-4 text-muted-foreground group-hover:text-primary transition-colors">
                    <category.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count}</p>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
