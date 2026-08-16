# Task G.1 — Proxy Route: generate-component

**Phase:** G — AI Developer Tools  
**Blocked by:** A.3  
**Blocks:** G.2, G.3, G.4  
**Week:** 9  
**AI Skill to use:** `senior-backend`, `nodejs-backend-patterns`

---

## 1. What I'm Building

The backend proxy route `/api/ai/generate-component` in Next.js that validates prompt requests, applies IP-based rate limiting, queries the Anthropic API, and streams JSX component code token-by-token using Server-Sent Events (SSE).

---

## 2. Architectural Decisions & Trade-offs

- **Server-Side Key Containment**: The Anthropic API key must never be exposed to the browser. Running the SDK server-side prevents key leakage.
- **Server-Sent Events (SSE) Stream**: SSE is unidirectional and lighter than WebSockets. It streams code blocks token-by-token, which reduces perceived loading times for users.
- **In-Memory Rate Limiter**: An in-memory cache map blocks spam requests. This is simple and cost-effective for portfolio projects.

---

## 3. Implementation Plan & Approach

### 1. Create `apps/docs/pages/api/ai/generate-component.ts`

Implement the Next.js API route:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

// Zod Input Schema validation
const inputSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(1000, 'Prompt too long'),
});

// In-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 20; // 20 requests per hour
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }

  if (entry.count >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: LIMIT - entry.count };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Zod input validation
  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  // 2. IP extraction & Rate limiting
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again in an hour.' });
  }

  // 3. API key check
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI Service unavailable (missing API key)' });
  }

  // 4. Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Prevent buffering

  try {
    const anthropic = new Anthropic({ apiKey });

    // 5. Query Anthropic messages stream
    const stream = anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: `You are an AI assistant designed to generate React components using the '@yourusername/ui' library.
      Respond only with clean JSX component code blocks. Do not add markdown fences. 
      Only use components from our system: Button, Input, Label, Text, Heading, Icon, VisuallyHidden, Portal.`,
      messages: [{ role: 'user', content: parsed.data.prompt }],
    });

    // 6. Pipe tokens to SSE stream
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Streaming error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Unexpected generation failure' })}\n\n`);
    res.end();
  }
}
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Nginx Buffering**: Nginx and CDNs like Cloudflare cache chunked transfers. Set `X-Accel-Buffering: no` to prevent response buffering.
- **Serverless Timeout limits**: Vercel serverless functions on the free tier time out after 10 seconds. Keep prompts focused and limit maximum output tokens to fit within limits.

---

## 5. Definition of Done

- [ ] Next.js API route exists at `/api/ai/generate-component`.
- [ ] Zod schema rejects empty prompts.
- [ ] Requests stream text chunk tokens successfully.
- [ ] Missing API keys throw standard HTTP 503 service exceptions.

---

## 6. QA Test Scenarios

| Scenario               | Command                                                                                                                        | Expected Result                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Verify SSE stream      | `curl -N -X POST -H "Content-Type: application/json" -d '{"prompt":"button"}' http://localhost:3000/api/ai/generate-component` | Terminal streams JSON chunks in SSE format.            |
| Test validation errors | Send empty prompt request                                                                                                      | Returns HTTP 400 containing validation messages.       |
| Verify missing key     | Remove ANTHROPIC_API_KEY from environment and test                                                                             | Returns HTTP 503 containing service unavailable error. |

---

## 7. AI Code Loop Prompt

```
TASK: G.1 — Proxy Route: generate-component

Create apps/docs/pages/api/ai/generate-component.ts.
Set up Zod to validate POST body prompt properties.
Implement IP-based rate limiting map (max 20 req/hour).
Configure Server-Sent Events headers.
Initialize Anthropic SDK using process.env.ANTHROPIC_API_KEY and stream responses.
Pipe text deltas as SSE data strings, writing a [DONE] marker at the end of the stream.
```
