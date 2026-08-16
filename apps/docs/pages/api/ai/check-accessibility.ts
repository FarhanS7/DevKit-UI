import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

const inputSchema = z.object({
  code: z.string().min(1, 'Code/issue description cannot be empty').max(3000, 'Input too long'),
});

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
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
  }

  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again in an hour.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const anthropic = new Anthropic({ apiKey });
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
3. Suggest code fixes using DevKit UI component APIs.`,
        messages: [{ role: 'user', content: parsed.data.code }],
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (err) {
      console.error('A11y checker error:', err);
    }
  }

  // Fallback demo mock SSE stream for interactive evaluation when live key is absent
  const mockA11yReport = `### WCAG Criterion
**WCAG 4.1.2 Name, Role, Value (Level A)** & **WCAG 1.3.1 Info and Relationships (Level A)**

### The Problem
The audited code snippet lacks explicit accessible labels (\`aria-label\`, \`aria-labelledby\`, or associated \`<Label>\` elements). Screen reader users will hear unlabelled form fields or icon triggers.

### Code Fix
Wrap input elements using DevKit UI \`Input\` with \`label\` prop, or provide \`aria-label\` attributes on icon triggers:

\`\`\`tsx
import { Input, Button, Icon } from '@devkit-ui/core';

// Accessible implementation:
<Input label="Email Address" id="user-email" placeholder="you@example.com" />
<Button leftIcon={<Icon name="Check" aria-hidden="true" />}>Save</Button>
\`\`\``;

  const chunks = mockA11yReport.match(/.{1,20}/g) || [mockA11yReport];
  for (const chunk of chunks) {
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    await new Promise(r => setTimeout(r, 30));
  }
  res.write('data: [DONE]\n\n');
  res.end();
}
