"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";
import type { GitHubUser, GitHubRepo, LanguageStat } from "@/lib/github";
import {
  GitBranch,
  Star,
  GitFork,
  ExternalLink,
  Search,
  Users,
  BookOpen,
} from "lucide-react";

interface GitHubData {
  user: GitHubUser;
  repos: GitHubRepo[];
  languageStats: LanguageStat[];
}

export default function GitHubAnalyzer() {
  const [username, setUsername] = useState("");
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github?username=${encodeURIComponent(username.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch GitHub data");
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const topRepos = data?.repos
    .slice()
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            GitHub Profile Analyzer
          </CardTitle>
          <CardDescription>
            Analyze any public GitHub profile to discover language expertise and project portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="Enter GitHub username (e.g. torvalds)"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button onClick={handleAnalyze} loading={loading} disabled={!username.trim()}>
              <Search className="mr-2 h-4 w-4" />
              Analyze
            </Button>
          </div>
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Profile Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-5">
                <img
                  src={data.user.avatar_url}
                  alt={data.user.login}
                  className="h-20 w-20 rounded-full border-2 border-gray-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">{data.user.name ?? data.user.login}</h2>
                    <a
                      href={data.user.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-sm text-gray-500">@{data.user.login}</p>
                  {data.user.bio && (
                    <p className="mt-1 text-sm text-gray-700">{data.user.bio}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {formatNumber(data.user.followers)} followers
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {data.user.public_repos} public repos
                    </span>
                    {data.user.location && <span>📍 {data.user.location}</span>}
                    {data.user.company && <span>🏢 {data.user.company}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Primary languages across all repositories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.languageStats.slice(0, 8)}
                      dataKey="count"
                      nameKey="language"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(props) => {
                        const entry = props as unknown as { language: string; percentage: number };
                        return `${entry.language} ${entry.percentage}%`;
                      }}
                      labelLine={false}
                    >
                      {data.languageStats.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `${value} repos`,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Repository Count by Language</CardTitle>
                <CardDescription>Top languages by number of repositories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.languageStats.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="language" type="category" width={90} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${v} repos`]} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {data.languageStats.slice(0, 8).map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Repositories */}
          <Card>
            <CardHeader>
              <CardTitle>Top Repositories</CardTitle>
              <CardDescription>Most starred projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topRepos?.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-blue-600 group-hover:underline">
                        {repo.name}
                      </span>
                      {repo.language && (
                        <Badge variant="secondary">{repo.language}</Badge>
                      )}
                    </div>
                    {repo.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{repo.description}</p>
                    )}
                    <div className="mt-3 flex gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {formatNumber(repo.stargazers_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="h-3 w-3" />
                        {formatNumber(repo.forks_count)}
                      </span>
                      <span>Updated {formatDate(repo.updated_at)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
