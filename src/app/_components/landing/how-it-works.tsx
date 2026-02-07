"use client";

import { UserPlus, SearchCheck, Rocket } from "lucide-react";

const steps = [
  {
    title: "Post a job (it's free)",
    description:
      "Tell us about the project or role. Our merit-based matching system will help you describe the skills you need.",
    icon: UserPlus,
  },
  {
    title: "Talent comes to you",
    description:
      "Get qualified intern proposals within 24 hours. Compare bids, reviews, and prior work samples.",
    icon: SearchCheck,
  },
  {
    title: "Collaborate easily",
    description:
      "Use Uprise to chat, share files, and collaborate from your desktop or mobile.",
    icon: Rocket,
  },
];

export function HowItWorks() {
  return (
    <div className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-12">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                <step.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
