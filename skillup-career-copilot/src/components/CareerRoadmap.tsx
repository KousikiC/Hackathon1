"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Map, Clock, BookOpen, ChevronDown, ChevronRight } from "lucide-react";

interface Milestone {
  title: string;
  duration: string;
  skills: string[];
  resources: string[];
  priority: "high" | "medium" | "low";
}

interface RoadmapData {
  role: string;
  totalMonths: number;
  milestones: Milestone[];
  salaryRange: string;
  demandLevel: string;
}

const ROADMAPS: Record<string, RoadmapData> = {
  "Frontend Engineer": {
    role: "Frontend Engineer",
    totalMonths: 9,
    salaryRange: "$90k – $160k",
    demandLevel: "Very High",
    milestones: [
      {
        title: "Core Foundations",
        duration: "Month 1–2",
        priority: "high",
        skills: ["HTML5 / CSS3", "JavaScript ES6+", "TypeScript basics", "Git & GitHub"],
        resources: ["MDN Web Docs", "javascript.info", "TypeScript Handbook"],
      },
      {
        title: "React Ecosystem",
        duration: "Month 3–4",
        priority: "high",
        skills: ["React hooks & context", "Next.js App Router", "Tailwind CSS", "Component design"],
        resources: ["react.dev", "Next.js docs", "Tailwind docs"],
      },
      {
        title: "State & Data Fetching",
        duration: "Month 5",
        priority: "high",
        skills: ["TanStack Query", "Zustand / Redux Toolkit", "REST & GraphQL", "SWR"],
        resources: ["TanStack docs", "Apollo GraphQL docs"],
      },
      {
        title: "Testing & Quality",
        duration: "Month 6",
        priority: "medium",
        skills: ["Jest", "React Testing Library", "Cypress / Playwright", "Web Vitals"],
        resources: ["testing-library.com", "Playwright docs"],
      },
      {
        title: "Performance & Deployment",
        duration: "Month 7–8",
        priority: "medium",
        skills: ["Code splitting", "Lazy loading", "Vercel / Netlify", "Docker basics"],
        resources: ["web.dev/performance", "Vercel docs"],
      },
      {
        title: "Senior Skills",
        duration: "Month 9",
        priority: "low",
        skills: ["Design systems", "Micro-frontends", "Web accessibility", "Open-source contribution"],
        resources: ["ARIA spec", "Storybook docs"],
      },
    ],
  },
  "Backend Engineer": {
    role: "Backend Engineer",
    totalMonths: 10,
    salaryRange: "$95k – $175k",
    demandLevel: "High",
    milestones: [
      {
        title: "Language Fundamentals",
        duration: "Month 1–2",
        priority: "high",
        skills: ["Node.js / Python", "TypeScript / type hints", "OOP & functional patterns"],
        resources: ["Node.js docs", "Python docs"],
      },
      {
        title: "API Design",
        duration: "Month 3–4",
        priority: "high",
        skills: ["REST best practices", "Express / Fastify", "GraphQL", "OpenAPI / Swagger"],
        resources: ["REST API tutorial", "Fastify docs"],
      },
      {
        title: "Databases",
        duration: "Month 5",
        priority: "high",
        skills: ["PostgreSQL", "SQL optimization", "Redis caching", "ORM (Prisma / SQLAlchemy)"],
        resources: ["PostgreSQL tutorial", "Redis docs"],
      },
      {
        title: "Architecture Patterns",
        duration: "Month 6–7",
        priority: "medium",
        skills: ["Microservices", "Message queues (RabbitMQ / Kafka)", "Event-driven design", "CQRS"],
        resources: ["microservices.io", "Kafka docs"],
      },
      {
        title: "DevOps & Cloud",
        duration: "Month 8–9",
        priority: "medium",
        skills: ["Docker & Kubernetes", "CI/CD (GitHub Actions)", "AWS / GCP basics", "Monitoring"],
        resources: ["Docker docs", "AWS free tier"],
      },
      {
        title: "Security & Scale",
        duration: "Month 10",
        priority: "low",
        skills: ["Auth (JWT / OAuth)", "Rate limiting", "Horizontal scaling", "Load testing"],
        resources: ["OWASP guides", "k6 docs"],
      },
    ],
  },
  "ML Engineer": {
    role: "ML Engineer",
    totalMonths: 12,
    salaryRange: "$110k – $190k",
    demandLevel: "Explosive",
    milestones: [
      {
        title: "Python & Math",
        duration: "Month 1–2",
        priority: "high",
        skills: ["Python advanced", "NumPy / Pandas", "Linear algebra", "Statistics & probability"],
        resources: ["fast.ai", "3Blue1Brown linear algebra"],
      },
      {
        title: "Classical ML",
        duration: "Month 3–4",
        priority: "high",
        skills: ["Scikit-learn", "Regression / Classification", "Feature engineering", "Cross-validation"],
        resources: ["Hands-On ML (Aurélien Géron)", "Kaggle Learn"],
      },
      {
        title: "Deep Learning",
        duration: "Month 5–6",
        priority: "high",
        skills: ["PyTorch / TensorFlow", "CNNs / RNNs", "Transformers", "Transfer learning"],
        resources: ["PyTorch tutorials", "d2l.ai"],
      },
      {
        title: "LLMs & Generative AI",
        duration: "Month 7–8",
        priority: "high",
        skills: ["Prompt engineering", "RAG pipelines", "LangChain / LlamaIndex", "Fine-tuning"],
        resources: ["DeepLearning.AI short courses", "Hugging Face docs"],
      },
      {
        title: "MLOps",
        duration: "Month 9–10",
        priority: "medium",
        skills: ["MLflow", "Model serving (FastAPI)", "Vector databases", "Data versioning (DVC)"],
        resources: ["MLflow docs", "Pinecone guides"],
      },
      {
        title: "Production & Scale",
        duration: "Month 11–12",
        priority: "low",
        skills: ["Distributed training", "A/B testing models", "Monitoring drift", "Cost optimization"],
        resources: ["Google ML Crash Course"],
      },
    ],
  },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "#dc2626",
  medium: "#d97706",
  low: "#2563eb",
};

export default function CareerRoadmap() {
  const roles = Object.keys(ROADMAPS);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const roadmap = ROADMAPS[selectedRole];
  const completedMonths = 2; // Could be dynamic based on user progress

  const chartData = roadmap.milestones.map((m, i) => ({
    name: `M${i + 1}`,
    months: parseInt(m.duration.match(/\d+/g)?.[0] ?? "1"),
    priority: m.priority,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Career Roadmap Planner
          </CardTitle>
          <CardDescription>
            Structured learning path with milestones, resources, and timelines for your target role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setSelectedRole(r);
                  setExpandedIndex(0);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedRole === r
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{roadmap.totalMonths} mo</p>
              <p className="text-xs text-gray-500">Estimated Timeline</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <span className="text-sm font-bold text-green-700">$</span>
            </div>
            <div>
              <p className="text-lg font-bold">{roadmap.salaryRange}</p>
              <p className="text-xs text-gray-500">Typical Salary Range</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <span className="text-sm font-bold text-purple-700">↑</span>
            </div>
            <div>
              <p className="text-lg font-bold">{roadmap.demandLevel}</p>
              <p className="text-xs text-gray-500">Market Demand</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Month {completedMonths} of {roadmap.totalMonths}</span>
            <span>{Math.round((completedMonths / roadmap.totalMonths) * 100)}% complete</span>
          </div>
          <Progress
            value={completedMonths}
            max={roadmap.totalMonths}
            color="#2563eb"
          />
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={chartData} margin={{ top: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis hide />
                <Tooltip formatter={(v) => [`${v} mo`]} />
                <Bar dataKey="months" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-1 text-center text-xs text-gray-400">Milestone duration in months</p>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="space-y-3">
        {roadmap.milestones.map((milestone, index) => (
          <Card key={index}>
            <button
              className="w-full text-left"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: PRIORITY_COLORS[milestone.priority] }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{milestone.title}</p>
                    <p className="text-xs text-gray-500">{milestone.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      milestone.priority === "high"
                        ? "destructive"
                        : milestone.priority === "medium"
                        ? "warning"
                        : "default"
                    }
                  >
                    {milestone.priority}
                  </Badge>
                  {expandedIndex === index ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </CardContent>
            </button>

            {expandedIndex === index && (
              <CardContent className="pt-0 pb-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Skills to Learn
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {milestone.skills.map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <BookOpen className="mr-1 inline h-3 w-3" />
                      Resources
                    </p>
                    <ul className="space-y-1">
                      {milestone.resources.map((r) => (
                        <li key={r} className="text-sm text-gray-600">
                          • {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
