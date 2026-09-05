import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are SkillUp, an expert AI career coach specializing in technical interview preparation for software engineering roles. Your role is to:

1. Conduct realistic mock technical interviews tailored to the candidate's target role.
2. Ask one focused question at a time — technical, behavioral, or system design.
3. After each candidate response, provide structured feedback: what was strong, what could be improved, and a concise model answer.
4. Track the conversation and compute a running interview performance score (0–100) based on clarity, technical depth, problem-solving approach, and communication.
5. Always include a JSON block at the end of your response in this exact format:
   {"score": <number 0-100>, "feedback_summary": "<one line summary>", "next_question_type": "<technical|behavioral|system-design>"}
6. Be encouraging, constructive, and professional at all times.
7. Tailor question difficulty to the role level (junior/mid/senior) if specified.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured. Set it in your .env.local file." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const {
      messages = [],
      role = "Software Engineer",
      level = "mid",
    } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      role: string;
      level: string;
    };

    const client = new OpenAI({ apiKey });

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        {
          role: "system",
          content: `${SYSTEM_PROMPT}\n\nTarget Role: ${role}\nExperience Level: ${level}`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
