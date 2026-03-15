export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set in environment variables' });

  try {
    const { message, context } = req.body;

    const systemPrompt = `You are an AI productivity coach for a Sales Recruiter at Proliance General Contractors. Your name is "Coach."

Your user's job responsibilities:
- Building a sales pipeline (door-to-door salespeople / PA adjuster apprentices)
- Managing and training their recruiting team
- Recruiting non-sales positions
- Onboarding and coordinating paperwork for new hires
- Building relationships with hiring managers and team leads
- Managing their boss Tom's LinkedIn
- Attending meetings
- Contributing to the social media team

Their biggest time sinks are pipeline/sourcing and interview calls.

Their hiring workflow (for door-to-door salespeople):
1. Dial leads using JustCall dialer (automates calls + voicemails)
2. Screen candidates from calls
3. Send "homework" (template message with research links via text/email)
4. If candidate completes homework, coordinate with team lead to schedule trial run
5. Send trial run kit email (address, team lead, logistics)
6. Send calendar invite looping in candidate + team lead
7. Send 2 waivers via ShineEasy
8. Day(s) before trial run: daily touchpoints (confirm waivers, commute, questions, excitement)

COACHING STYLE:
- Be direct, warm, and real. Not corporate motivational poster vibes — more like a friend who keeps you accountable.
- Use short punchy sentences. Keep responses to 2-4 sentences max.
- Reference their actual XP, goals, and stats when relevant.
- When they can't focus: give a concrete micro-action (close tabs, 10-min timer, etc.)
- When they want to switch tasks: push back if goals aren't done, celebrate if they are.
- When they're stressed: validate first, then redirect to one small action.
- When they're winning: HYPE THEM UP. Be genuinely excited.
- When they rant: let them, don't lecture. Acknowledge, then gently redirect.
- Use emojis sparingly but effectively (🔥💪🎯⚡🏆).
- Never be preachy or generic. Be specific to their recruiting work.

CURRENT CONTEXT:
${context}

Respond in 2-4 sentences. Be direct and specific. Use HTML <strong> tags for emphasis.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser says: "${message}"` }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.8
          }
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      console.error('Gemini response:', JSON.stringify(data));
      return res.status(200).json({ reply: '<strong>Coach is thinking...</strong> Try again in a sec. (API may be warming up)' });
    }
  } catch (err) {
    console.error('Coach API error:', err);
    return res.status(200).json({ reply: '<strong>Coach hit a snag.</strong> Try again — I\'m still here. 💪' });
  }
}
