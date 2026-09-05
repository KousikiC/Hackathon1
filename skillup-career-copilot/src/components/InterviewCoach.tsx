"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, User, Send, RotateCcw, Trophy, Mic } from "lucide-react";
import { ROLE_SKILL_REQUIREMENTS } from "@/lib/skills-data";

type MessageRole = "user" | "assistant";

interface Message {
  role: MessageRole;
  content: string;
  score?: number;
}

const ROLES = Object.keys(ROLE_SKILL_REQUIREMENTS);
const LEVELS = ["junior", "mid", "senior", "staff"];

export default function InterviewCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [level, setLevel] = useState("mid");
  const [streaming, setStreaming] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function parseScoreFromContent(content: string): number | null {
    const match = content.match(/"score"\s*:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  function stripJsonBlock(content: string): string {
    return content.replace(/\{[\s\S]*?"score"\s*:[\s\S]*?\}/g, "").trim();
  }

  async function startSession() {
    setMessages([]);
    setScore(null);
    setSessionStarted(true);
    await sendMessage(
      `Please start my mock interview for a ${level}-level ${role} position. Begin with your first question.`,
      []
    );
  }

  async function handleSend() {
    if (!input.trim() || streaming) return;
    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    await sendMessage(userMessage, newMessages);
  }

  async function sendMessage(userContent: string, history: Message[]) {
    setStreaming(true);
    const apiMessages = history.map((m) => ({
      role: m.role,
      content: stripJsonBlock(m.content),
    }));

    // Add current user message if not already in history
    if (history.length === 0 || history[history.length - 1].content !== userContent) {
      apiMessages.push({ role: "user", content: userContent });
    }

    let fullContent = "";
    const placeholderIndex = history.length === 0 ? 0 : history.length;

    setMessages((prev) => [
      ...prev.filter((_, i) => i < placeholderIndex),
      { role: "assistant", content: "▌" },
    ]);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, role, level }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Interview API error");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data:"));
        for (const line of lines) {
          const data = line.slice(5).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.delta) {
              fullContent += parsed.delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: fullContent + "▌",
                };
                return updated;
              });
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }

      const parsedScore = parseScoreFromContent(fullContent);
      if (parsedScore !== null) setScore(parsedScore);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: fullContent,
          score: parsedScore ?? undefined,
        };
        return updated;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `⚠️ Error: ${msg}`,
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  const scoreColor =
    score === null ? "#3b82f6" : score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#dc2626";

  return (
    <div className="space-y-6">
      {/* Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Interview Coach
          </CardTitle>
          <CardDescription>
            Live conversational mock interviews powered by GPT-4o-mini with real-time scoring and
            structured feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Target Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={sessionStarted && messages.length > 0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={sessionStarted && messages.length > 0}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={startSession} loading={streaming} variant="default">
              {sessionStarted ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restart Session
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Interview
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Score Bar */}
      {score !== null && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-4">
              <Trophy className="h-5 w-5 flex-shrink-0" style={{ color: scoreColor }} />
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">Interview Score</span>
                  <span className="font-bold" style={{ color: scoreColor }}>
                    {score}/100
                  </span>
                </div>
                <Progress value={score} color={scoreColor} />
              </div>
              <Badge
                variant={score >= 70 ? "success" : score >= 40 ? "warning" : "destructive"}
                className="flex-shrink-0"
              >
                {score >= 70 ? "Strong" : score >= 40 ? "Improving" : "Needs Work"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Window */}
      {sessionStarted && (
        <Card>
          <CardContent className="p-0">
            <div className="h-[480px] overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {stripJsonBlock(msg.content)}
                    </p>
                    {msg.score !== undefined && (
                      <div className="mt-2 rounded-lg bg-white/20 px-2 py-1 text-xs font-medium">
                        Score: {msg.score}/100
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={streaming}
                  rows={2}
                  placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
                  className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                />
                <Button
                  onClick={handleSend}
                  loading={streaming}
                  disabled={!input.trim()}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
