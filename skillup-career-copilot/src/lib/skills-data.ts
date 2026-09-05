// Static skill requirements data — safe to import in both client and server components.
// The Pinecone SDK itself lives only in lib/pinecone.ts (server-only).

export const ROLE_SKILL_REQUIREMENTS: Record<
  string,
  Array<{ skill: string; category: string; importance: "critical" | "important" | "nice-to-have" }>
> = {
  "Frontend Engineer": [
    { skill: "React", category: "Framework", importance: "critical" },
    { skill: "TypeScript", category: "Language", importance: "critical" },
    { skill: "CSS / Tailwind", category: "Styling", importance: "critical" },
    { skill: "Next.js", category: "Framework", importance: "important" },
    { skill: "Testing (Jest/RTL)", category: "Testing", importance: "important" },
    { skill: "GraphQL", category: "API", importance: "nice-to-have" },
    { skill: "Web Performance", category: "Optimization", importance: "important" },
    { skill: "Accessibility (a11y)", category: "UX", importance: "important" },
  ],
  "Backend Engineer": [
    { skill: "Node.js", category: "Runtime", importance: "critical" },
    { skill: "REST API Design", category: "API", importance: "critical" },
    { skill: "SQL / PostgreSQL", category: "Database", importance: "critical" },
    { skill: "Docker", category: "DevOps", importance: "important" },
    { skill: "Redis", category: "Caching", importance: "important" },
    { skill: "Kubernetes", category: "DevOps", importance: "nice-to-have" },
    { skill: "Message Queues", category: "Architecture", importance: "important" },
    { skill: "CI/CD Pipelines", category: "DevOps", importance: "important" },
  ],
  "ML Engineer": [
    { skill: "Python", category: "Language", importance: "critical" },
    { skill: "PyTorch / TensorFlow", category: "Framework", importance: "critical" },
    { skill: "Scikit-learn", category: "Library", importance: "critical" },
    { skill: "Data Preprocessing", category: "Data", importance: "critical" },
    { skill: "Model Deployment", category: "MLOps", importance: "important" },
    { skill: "Vector Databases", category: "Storage", importance: "important" },
    { skill: "LLM Fine-tuning", category: "AI", importance: "nice-to-have" },
    { skill: "Apache Spark", category: "Big Data", importance: "nice-to-have" },
  ],
  "Full Stack Engineer": [
    { skill: "React / Next.js", category: "Frontend", importance: "critical" },
    { skill: "Node.js / Express", category: "Backend", importance: "critical" },
    { skill: "PostgreSQL / MongoDB", category: "Database", importance: "critical" },
    { skill: "TypeScript", category: "Language", importance: "critical" },
    { skill: "Docker", category: "DevOps", importance: "important" },
    { skill: "Cloud (AWS/GCP/Azure)", category: "Cloud", importance: "important" },
    { skill: "GraphQL", category: "API", importance: "nice-to-have" },
    { skill: "CI/CD", category: "DevOps", importance: "important" },
  ],
};
