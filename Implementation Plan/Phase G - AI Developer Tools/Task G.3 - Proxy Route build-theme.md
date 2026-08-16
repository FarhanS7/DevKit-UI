# Task G.3 — Proxy Route: build-theme

**Phase:** G — AI Developer Tools  
**Blocked by:** G.1  
**Blocks:** G.6  
**Week:** 9  
**AI Skill to use:** `senior-backend`

---

## 1. What I'm Building

The backend proxy route `/api/ai/build-theme` in Next.js that interprets text themes, checks contrast requirements, and streams a JSON-formatted Style Dictionary semantic token override map.

---

## 2. Architectural Decisions & Trade-offs

- **JSON Payload Constraint**: The system prompt forces Claude to return ONLY a raw JSON dictionary without Markdown fences (` ```json `). This allows direct client-side parsing without complex regex extractions.
- **Contrast Check Constraint**: Emphasize WCAG contrast ratios in the system prompt. It instructs Claude to only generate colors that achieve at least a `4.5:1` contrast ratio between text and page background overrides.

---

## 3. Implementation Plan & Approach

### 1. Create `apps/docs/pages/api/ai/build-theme.ts`

Implement the Next.js API route:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

const inputSchema = z.object({
  prompt: z.string().min(1, 'Theme prompt cannot be empty').max(1000, 'Input too long'),
});

// In-memory rate limiting map
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

    // Stream Style Dictionary overrides JSON
    const stream = anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: `You are an expert design systems engineer generating theme configurations.
      Guidelines:
      1. Interpret user theme request (e.g. "tech dark", "nature light").
      2. Return ONLY a valid JSON object matching our Style Dictionary variables:
         {
           "color": {
             "brand": {
               "primary": { "value": "#hex" },
               "primary-hover": { "value": "#hex" }
             },
             "neutral": {
               "50": { "value": "#hex" },
               "950": { "value": "#hex" }
             }
           }
         }
      3. Return NO markdown wraps, NO code fences, and NO conversational text. Just the raw JSON content.
      4. Ensure all generated colors meet at least 4.5:1 WCAG contrast against each other.`,
      messages: [{ role: 'user', content: parsed.data.prompt }],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Theme builder error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Theme overrides stream failed' })}\n\n`);
    res.end();
  }
}
```

---

## 4. Best Practices & Real-life Engineering Gotchas

- **Fenced JSON Cleanup**: Claude might occasionally add code blocks (e.g. \`\`\`json) despite instructions. The UI component parser should clean up fences (strip leading/trailing ticks and tag labels) before running `JSON.parse` to prevent parsing exceptions.
- **Contrast calculation**: The UI should calculate contrast ratios using relative luminance math on hex outputs to warn users of accessibility violations.

---

## 5. Definition of Done

- [ ] Next.js API route exists at `/api/ai/build-theme`.
- [ ] Returns valid semantic token JSON structure mappings.
- [ ] SSE streams JSON payload tokens.

---

## 6. QA Test Scenarios

| Scenario                      | Command                                                                                                                       | Expected Result                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Verify build-theme SSE stream | `curl -N -X POST -H "Content-Type: application/json" -d '{"prompt":"nature light"}' http://localhost:3000/api/ai/build-theme` | Returns streamed JSON chunks representing colors overrides. |
| Test validation errors        | Send empty prompt requests                                                                                                    | Returns HTTP 400 containing validation messages.            |

---

## 7. AI Code Loop Prompt

```
TASK: G.3 — Proxy Route: build-theme

Create apps/docs/pages/api/ai/build-theme.ts.
Set up Zod to validate POST body prompt properties.
Configure Server-Sent Events headers.
Initialize Anthropic SDK and stream JSON variables overrides.
Instruct Claude to return only raw JSON matching Style Dictionary paths, ensuring 4.5:1 WCAG contrast.
Pipe text deltas as SSE data strings, writing a [DONE] marker at the end.
```
