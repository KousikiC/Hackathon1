import { NextRequest, NextResponse } from "next/server";
import { ROLE_SKILL_REQUIREMENTS } from "@/lib/skills-data";

export interface SkillGapResult {
  role: string;
  userSkills: string[];
  required: Array<{
    skill: string;
    category: string;
    importance: "critical" | "important" | "nice-to-have";
    hasSkill: boolean;
  }>;
  gapScore: number;
  coveredCount: number;
  totalCount: number;
}

export async function POST(req: NextRequest) {
  try {
    const { userSkills, targetRole } = await req.json() as {
      userSkills: string[];
      targetRole: string;
    };

    if (!targetRole || !userSkills) {
      return NextResponse.json(
        { error: "targetRole and userSkills are required" },
        { status: 400 }
      );
    }

    const requirements = ROLE_SKILL_REQUIREMENTS[targetRole];
    if (!requirements) {
      return NextResponse.json(
        { error: `Unknown role: ${targetRole}. Available: ${Object.keys(ROLE_SKILL_REQUIREMENTS).join(", ")}` },
        { status: 400 }
      );
    }

    // Normalize user skills for case-insensitive matching
    const normalizedUserSkills = userSkills.map((s) => s.toLowerCase());

    const analyzed = requirements.map((req) => ({
      ...req,
      hasSkill: normalizedUserSkills.some(
        (us) =>
          us.includes(req.skill.toLowerCase()) ||
          req.skill.toLowerCase().includes(us)
      ),
    }));

    const criticalTotal = analyzed.filter((r) => r.importance === "critical").length;
    const criticalCovered = analyzed.filter((r) => r.importance === "critical" && r.hasSkill).length;
    const coveredCount = analyzed.filter((r) => r.hasSkill).length;

    // Score weights: critical 60%, important 30%, nice-to-have 10%
    const weightedScore =
      (criticalTotal > 0 ? (criticalCovered / criticalTotal) * 60 : 60) +
      (() => {
        const imp = analyzed.filter((r) => r.importance === "important");
        return imp.length > 0 ? (imp.filter((r) => r.hasSkill).length / imp.length) * 30 : 30;
      })() +
      (() => {
        const nth = analyzed.filter((r) => r.importance === "nice-to-have");
        return nth.length > 0 ? (nth.filter((r) => r.hasSkill).length / nth.length) * 10 : 10;
      })();

    const result: SkillGapResult = {
      role: targetRole,
      userSkills,
      required: analyzed,
      gapScore: Math.round(weightedScore),
      coveredCount,
      totalCount: requirements.length,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
