"use client";

import { useState } from "react";
import GitHubAnalyzer from "@/components/GitHubAnalyzer";
import SkillGapAnalyzer from "@/components/SkillGapAnalyzer";
import InterviewCoach from "@/components/InterviewCoach";
import CareerRoadmap from "@/components/CareerRoadmap";
import { GitBranch, Target, Bot, Map, Zap, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "github" | "skills" | "interview" | "roadmap";

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode; description: string }> = [
  {
    id: "github",
    label: "GitHub Analyzer",
    icon: <GitBranch className="h-4 w-4" />,
    description: "Analyze your GitHub profile and language expertise",
  },
  {
    id: "skills",
    label: "Skill Gap",
    icon: <Target className="h-4 w-4" />,
    description: "Discover skills you need for your target role",
  },
  {
    id: "interview",
    label: "Interview Coach",
    icon: <Bot className="h-4 w-4" />,
    description: "Practice with AI-powered mock interviews",
  },
  {
    id: "roadmap",
    label: "Career Roadmap",
    icon: <Map className="h-4 w-4" />,
    description: "Structured learning path to your goal",
  },
];

const STATS = [
  { label: "Learning Paths", value: "3+", icon: <Map className="h-5 w-5 text-blue-600" /> },
  { label: "Role Templates", value: "4", icon: <TrendingUp className="h-5 w-5 text-green-600" /> },
  { label: "AI-Powered", value: "100%", icon: <Zap className="h-5 w-5 text-yellow-500" /> },
  { label: "Interview Scoring", value: "Live", icon: <Award className="h-5 w-5 text-purple-600" /> },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("github");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-gray-900">SkillUp</span>
              <span className="ml-1.5 hidden text-xs font-medium text-blue-600 sm:inline">
                AI Career Copilot
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              ● Live APIs
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Your AI Career Copilot
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Analyze your GitHub profile, discover skill gaps, practice live AI mock interviews, and
            navigate your personalized career roadmap — all in one place.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <div className="flex justify-center">{stat.icon}</div>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-[57px] z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6">
          <nav className="flex gap-1 py-2" aria-label="Main Navigation">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Tab description */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {TABS.find((t) => t.id === activeTab)?.description}
          </p>
        </div>

        {activeTab === "github" && <GitHubAnalyzer />}
        {activeTab === "skills" && <SkillGapAnalyzer />}
        {activeTab === "interview" && <InterviewCoach />}
        {activeTab === "roadmap" && <CareerRoadmap />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">SkillUp – AI Career Copilot</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Powered by GitHub REST API · OpenAI GPT-4o-mini · Pinecone Vector DB
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <span>GitHub API</span>
            <span>·</span>
            <span>OpenAI API</span>
            <span>·</span>
            <span>Pinecone</span>
            <span>·</span>
            <span>Next.js App Router</span>
            <span>·</span>
            <span>Recharts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
