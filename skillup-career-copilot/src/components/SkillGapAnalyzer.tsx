"use client";

import { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, XCircle, AlertCircle, Zap } from "lucide-react";
import type { SkillGapResult } from "@/app/api/skills/route";
import { ROLE_SKILL_REQUIREMENTS } from "@/lib/skills-data";

const ROLES = Object.keys(ROLE_SKILL_REQUIREMENTS);

const IMPORTANCE_CONFIG = {
  critical: { label: "Critical", color: "bg-red-500", badge: "destructive" as const },
  important: { label: "Important", color: "bg-yellow-500", badge: "warning" as const },
  "nice-to-have": { label: "Nice to Have", color: "bg-blue-500", badge: "default" as const },
};

export default function SkillGapAnalyzer() {
  const [targetRole, setTargetRole] = useState(ROLES[0]);
  const [skillInput, setSkillInput] = useState("");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !userSkills.includes(trimmed)) {
      setUserSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setUserSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function handleAnalyze() {
    if (userSkills.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSkills, targetRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      setResult(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor =
    result
      ? result.gapScore >= 70
        ? "#16a34a"
        : result.gapScore >= 40
        ? "#d97706"
        : "#dc2626"
      : "#3b82f6";

  const radarData = result?.required.map((r) => ({
    skill: r.skill.length > 14 ? r.skill.slice(0, 14) + "…" : r.skill,
    score: r.hasSkill ? 100 : 0,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Config Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skill Gap Analyzer
          </CardTitle>
          <CardDescription>
            Powered by semantic role-skill matching via Pinecone vector search. Add your skills and
            choose a target role to find your gaps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role Selector */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Target Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Your Current Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Type a skill and press Enter (e.g. React, Python)"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Button variant="outline" onClick={addSkill} disabled={!skillInput.trim()}>
                Add
              </Button>
            </div>
            {userSkills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {userSkills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {s}
                    <button
                      onClick={() => removeSkill(s)}
                      className="ml-1 rounded-full hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleAnalyze}
            loading={loading}
            disabled={userSkills.length === 0}
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            Analyze Skill Gap
          </Button>
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Score Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div
                  className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
                  style={{ backgroundColor: scoreColor }}
                >
                  {result.gapScore}
                </div>
                <p className="text-sm font-medium text-gray-700">Readiness Score</p>
                <p className="text-xs text-gray-500">out of 100</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {result.coveredCount}/{result.totalCount}
                </p>
                <p className="text-sm text-gray-500">Skills Covered</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {result.totalCount - result.coveredCount}
                </p>
                <p className="text-sm text-gray-500">Skills to Learn</p>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Coverage Radar</CardTitle>
              <CardDescription>Visual map of your skill coverage vs. requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    name="Your Skills"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.3}
                  />
                  <Tooltip formatter={(v) => [v === 100 ? "✓ Have" : "✗ Missing"]} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skill Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Skill Breakdown</CardTitle>
              <CardDescription>
                Gaps for <span className="font-semibold">{result.role}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.required.map((item) => (
                  <div
                    key={item.skill}
                    className={`flex items-center gap-3 rounded-lg p-3 ${
                      item.hasSkill ? "bg-green-50" : "bg-gray-50"
                    }`}
                  >
                    {item.hasSkill ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.skill}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.category}</Badge>
                          <Badge variant={IMPORTANCE_CONFIG[item.importance].badge}>
                            {IMPORTANCE_CONFIG[item.importance].label}
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={item.hasSkill ? 100 : 0}
                        className="mt-1.5"
                        color={item.hasSkill ? "#16a34a" : "#e5e7eb"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
