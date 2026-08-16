# Task G.2 — Proxy Route: check-accessibility

**Phase:** G — AI Developer Tools  
**Blocked by:** G.1  
**Blocks:** G.5  
**Week:** 9  
**AI Skill to use:** `senior-backend`

---

## 1. What I'm Building

The backend proxy route `/api/ai/check-accessibility` in Next.js that parses element logs or component descriptions, checks them against WCAG 2.1 guidelines, and streams accessibility evaluations as Server-Sent Events (SSE).

---

## 2. Architectural Decisions & Trade-offs

- **Structured System Prompts**: We configure system prompts instructing Claude to parse code against WCAG 2.1 AA rules and output structured audit cards (`WCAG Criterion`, `The Problem`, `Code Fix`).
- **Shared Limiter Config**: Reuse the rate limiter logic from G.1 to prevent quota exhaust issues.

---

## 3. Implementation Plan & Approach

### 1. Create `apps/docs/pages/api/ai/check-accessibility.ts`

Implement the Next.js API route:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

const inputSchema = z.object({
  code: z.string().min(1, 'Code/issue description cannot be empty').max(3000, 'Input too long'),
});

// Re-use rate limit configurations (in-memory mock for v1)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }
  if (entry.count >= LIMIT) return { allowed: false, remaining: 0 };
  entry.count++;
  return { allowed: true, remaining: LIMIT - entry.count };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again in an hour.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI Service unavailable' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const anthropic = new Anthropic({ apiKey });

    // Stream WCAG accessibility analysis
    const stream = anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: `You are an expert accessibility consultant auditing React component code blocks.
      Auditing rules:
      1. Reference specific WCAG 2.1 AA success criteria.
      2. Return output in structured markdown headings:
         ### WCAG Criterion
         ### The Problem
         ### Code Fix
      3. Suggest code fixes only using the '@yourusername/ui' component APIs where applicable.`,
      messages: [{ role: 'user', content: parsed.data.code }],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('A11y checker error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Accessibility audit stream failed' })}\n\n`);
    res.end();
  }
}
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Component-level restrictions**: Ensure the system prompt prevents Claude from suggesting arbitrary third-party inputs or packages (such as importing from `@radix-ui/react-dialog` directly in the fix block). All suggestions should map to our core components.
- **Escape formatting tags**: Standard markdown code fences inside SSE streams can cause string parsing bugs. Ensure the UI handler is designed to parse markdown code formatting safely.

---

## 5. Definition of Done

- [ ] Next.js API route exists at `/api/ai/check-accessibility`.
- [ ] Submitting descriptions streams structured WCAG analysis text blocks.
- [ ] Pipeline rate limiter rejects requests that exceed window thresholds.

---

## 6. QA Test Scenarios

| Scenario               | Command                                                                                                                                  | Expected Result                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Verify A11y SSE stream | `curl -N -X POST -H "Content-Type: application/json" -d '{"code":"<button></button>"}' http://localhost:3000/api/ai/check-accessibility` | Streams markdown paragraphs analyzing missing text content triggers (WCAG 4.1.2). |
| Test validation errors | Send empty code checks                                                                                                                   | Returns HTTP 400 containing validation messages.                                  |

---

## 7. AI Code Loop Prompt

```
TASK: G.2 — Proxy Route: check-accessibility

Create apps/docs/pages/api/ai/check-accessibility.ts.
Set up Zod to validate POST body code properties.
Configure Server-Sent Events headers.
Initialize Anthropic SDK and stream WCAG accessibility assessments.
Pipe text deltas as SSE data strings, writing a [DONE] marker at the end.
```
