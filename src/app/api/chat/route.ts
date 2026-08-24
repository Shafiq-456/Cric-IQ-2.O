import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are CricIQ AI, an expert cricket intelligence assistant. You have deep knowledge of:
- International and domestic cricket across all formats (Test, ODI, T20I, T20 leagues)
- Player statistics, rankings, and form analysis
- Match history, head-to-head records, and venue analytics
- Bowling/batting techniques, strategies, and tactics
- ICC events, WTC, Champions Trophy, World Cup, T20 World Cup
- Emerging players, youth cricket, and future prospects

Rules:
- Be precise with statistics and numbers
- Use markdown formatting for structure (bold, lists, tables)
- When comparing players, provide head-to-head stats clearly
- If asked about very recent matches or future events, note that data may be limited
- Keep responses focused and evidence-based
- Use cricket terminology accurately
- For data you're uncertain about, provide your best knowledge with appropriate caveats
- Be enthusiastic about cricket but objective in analysis`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    // Build the messages array for Groq
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Groq API error:', response.status, errBody);
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({
      content: aiContent,
      model: data.model || 'llama-3.3-70b-versatile',
      usage: data.usage || null,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
