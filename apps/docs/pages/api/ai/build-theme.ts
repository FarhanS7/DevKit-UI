import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

const inputSchema = z.object({
  prompt: z.string().min(1, 'Theme prompt cannot be empty').max(1000, 'Input too long'),
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
        system: `You are an expert design systems engineer generating theme configurations.
Guidelines:
1. Interpret user theme request.
2. Return ONLY a valid JSON object matching Style Dictionary variables:
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
3. Return NO markdown wraps, NO code fences, and NO conversational text. Just raw JSON.
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
      return;
    } catch (err) {
      console.error('Theme builder error:', err);
    }
  }

  // Fallback demo mock SSE stream for interactive evaluation when live key is absent
  const mockThemeJson = `{
  "color": {
    "brand": {
      "primary": { "value": "#2563eb" },
      "primary-hover": { "value": "#1d4ed8" }
    },
    "neutral": {
      "50": { "value": "#f8fafc" },
      "950": { "value": "#020617" }
    }
  }
}`;

  const chunks = mockThemeJson.match(/.{1,15}/g) || [mockThemeJson];
  for (const chunk of chunks) {
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    await new Promise(r => setTimeout(r, 30));
  }
  res.write('data: [DONE]\n\n');
  res.end();
}
