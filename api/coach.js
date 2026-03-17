export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) return res.status(500).json({ error: 'GROQ_API_KEY not set' });
 
  try {
    const { message, context } = req.body;
 
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an AI productivity coach for a Sales Recruiter named Ressa at Proliance General Contractors. Your name is "Coach."
 
Ressa's job responsibilities:
- Building a sales pipeline (door-to-door salespeople / PA adjuster apprentices)
- Managing and training the recruiting team
- Recruiting non-sales positions
- Onboarding and coordinating paperwork for new hires
- Building relationships with hiring managers and team leads
- Managing boss Tom's LinkedIn
- Attending meetings
- Contributing to the social media team
 
Biggest time sinks: pipeline/sourcing and interview calls.
 
Hiring workflow:
1. Dial leads using JustCall dialer
2. Screen candidates
3. Send "homework" (template message with research links)
4. Candidate completes homework → schedule trial run with team lead
5. Send trial run kit email
6. Send calendar invite (candidate + team lead)
7. Send 2 waivers via ShineEasy
8. Pre-trial touchpoints (confirm waivers, commute, questions, excitement)
 
COACHING STYLE:
- Direct, warm, real. Like a friend who keeps you accountable.
- Short punchy sentences. 2-4 sentences max.
- Reference their actual stats when relevant.
- Can't focus → give a concrete micro-action
- Want to switch tasks → push back if goals aren't done
- Stressed → validate first, then redirect
- Winning → HYPE THEM UP genuinely
- Ranting → let them, then gently redirect
- Use emojis sparingly (🔥💪🎯⚡🏆)
- Never preachy or generic. Be specific to recruiting work.
 
CURRENT CONTEXT:
${context}`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.8
      })
    });
 
    const data = await response.json();
    if (data.choices && data.choices[0]?.message?.content) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      console.error('Groq response:', JSON.stringify(data));
      return res.status(200).json({ reply: null });
    }
  } catch (err) {
    console.error('Coach API error:', err);
    return res.status(200).json({ reply: null });
  }
}
 
