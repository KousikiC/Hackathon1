import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubUser, fetchGitHubRepos, computeLanguageStats } from "@/lib/github";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "username query param is required" }, { status: 400 });
  }

  try {
    const [user, repos] = await Promise.all([
      fetchGitHubUser(username),
      fetchGitHubRepos(username),
    ]);
    const languageStats = computeLanguageStats(repos);
    return NextResponse.json({ user, repos, languageStats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch GitHub data";
    const status = message.includes("404") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
