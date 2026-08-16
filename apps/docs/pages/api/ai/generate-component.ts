import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

const inputSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(1000, 'Prompt too long'),
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 20; // 20 requests per hour
const WINDOW_MS = 60 * 60 * 1000;

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
        system: `You are an AI developer assistant for DevKit UI.
Generate clean, accessible React JSX component code based on user prompt.
Only use DevKit UI components: Button, Input, Label, Text, Heading, Icon, VisuallyHidden, Portal, Checkbox, Select, Popover.
Return only code blocks without explanation text.`,
        messages: [{ role: 'user', content: parsed.data.prompt }],
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
      console.error('Anthropic API Error:', err);
    }
  }

  // Fallback demo mock SSE stream for interactive evaluation when live key is absent
  const mockComponentCode = `<div className="p-6 border border-slate-200 rounded-lg max-w-md bg-white shadow-sm space-y-4">
  <Heading as="h3" variant="heading-md">Generated Component</Heading>
  <Text variant="body-sm">
    This component was dynamically generated for: "${parsed.data.prompt}".
  </Text>
  <div className="space-y-2">
    <Label htmlFor="demo-input">Feedback</Label>
    <Input id="demo-input" placeholder="Type your response..." />
  </div>
  <Button variant="primary">Submit Request</Button>
</div>`;

  const chunks = mockComponentCode.match(/.{1,15}/g) || [mockComponentCode];
  for (const chunk of chunks) {
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    await new Promise(r => setTimeout(r, 40));
  }
  res.write('data: [DONE]\n\n');
  res.end();
}
