const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const Groq = require('groq-sdk');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Build the dynamic system prompt based on session info
function buildSystemPrompt(session) {
  const { job_role, experience_level, job_description } = session;

  const prompt = `You are Alex, a professional behavioral interviewer conducting a mock interview.

CANDIDATE PROFILE:
- Role they're preparing for: ${job_role}
- Experience level: ${experience_level}
${job_description ? `- Their background/job description they provided:\n${job_description}` : ''}

YOUR INTERVIEWING RULES (follow these strictly):
1. Ask ONE question at a time. Never ask multiple questions in one response.
2. Always respond directly to what the candidate ACTUALLY said — never give generic responses.
3. If their answer is VAGUE or missing details: probe with "Can you be more specific about what YOU did?" or "Walk me through that step by step."
4. If their answer is WEAK or lacks structure: challenge them with "What would you have done differently?" or "What was the actual outcome of that?"
5. If their answer is STRONG and structured: briefly acknowledge it, then slightly increase difficulty or explore a different dimension.
6. Look for STAR structure (Situation, Task, Action, Result). If any part is missing, ask about it specifically.
7. After 5-7 good exchanges covering different areas, close the interview naturally by saying "That wraps up our interview today. Thank you!" — then add INTERVIEW_COMPLETE at the very end of your message.
8. Start the interview by introducing yourself briefly and asking your first question.
9. Keep your responses concise — you're speaking out loud, not writing an essay.
10. Base your questions on the candidate's role and background provided above. Make it feel personalized.

IMPORTANT: You are having a SPOKEN conversation. Keep responses natural and conversational, not robotic.`;

  return prompt;
}

// GET - load session info when interview page opens
router.get('/:sessionId', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  const user_id = req.user.id;

  try {
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, user_id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    res.json({
      session: sessionResult.rows[0],
      messages: messagesResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load session' });
  }
});

// POST - get AI opening message (called when interview starts)
router.post('/:sessionId/start', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  const user_id = req.user.id;

  try {
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, user_id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = sessionResult.rows[0];

    // Check if AI already sent opening (don't send twice)
    const existingMessages = await pool.query(
      'SELECT id FROM messages WHERE session_id = $1',
      [sessionId]
    );

    if (existingMessages.rows.length > 0) {
      return res.status(400).json({ error: 'Session already started' });
    }

    const systemPrompt = buildSystemPrompt(session);

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: 'Start the interview now. Introduce yourself as Alex and ask your first behavioral question based on the candidate role and background.'
        }
      ],
      max_tokens: 300
    });

    const aiOpening = result.choices[0].message.content;

    // Save AI opening to DB
    await pool.query(
      'INSERT INTO messages (session_id, speaker, content) VALUES ($1, $2, $3)',
      [sessionId, 'ai', aiOpening]
    );

    res.json({ response: aiOpening });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

// POST - candidate sends a message, AI responds
router.post('/:sessionId/message', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;

  try {
    // Verify session belongs to this user and is active
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2 AND status = $3',
      [sessionId, user_id, 'active']
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    const session = sessionResult.rows[0];

    // Save candidate's message to DB
    await pool.query(
      'INSERT INTO messages (session_id, speaker, content) VALUES ($1, $2, $3)',
      [sessionId, 'candidate', content]
    );

    // Get full conversation history from DB
    const historyResult = await pool.query(
      'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    const messages = historyResult.rows;
    const systemPrompt = buildSystemPrompt(session);

    // Build Groq messages array with full history
    const groqMessages = [{ role: 'system', content: systemPrompt }];

    for (const msg of messages) {
      groqMessages.push({
        role: msg.speaker === 'candidate' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // Call Groq with full conversation context
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      max_tokens: 300
    });

    const aiResponse = result.choices[0].message.content;

    // Check if interview is complete
    const isComplete = aiResponse.includes('INTERVIEW_COMPLETE');
    const cleanResponse = aiResponse.replace('INTERVIEW_COMPLETE', '').trim();

    // Save AI response to DB
    await pool.query(
      'INSERT INTO messages (session_id, speaker, content) VALUES ($1, $2, $3)',
      [sessionId, 'ai', cleanResponse]
    );

    // If complete, mark session as ended
    if (isComplete) {
      await pool.query(
        'UPDATE sessions SET status = $1, ended_at = NOW() WHERE id = $2',
        ['completed', sessionId]
      );
    }

    res.json({
      response: cleanResponse,
      isComplete
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// POST - end session manually
router.post('/:sessionId/end', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  const user_id = req.user.id;

  try {
    await pool.query(
      'UPDATE sessions SET status = $1, ended_at = NOW() WHERE id = $2 AND user_id = $3',
      ['completed', sessionId, user_id]
    );

    res.json({ message: 'Session ended' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// POST - generate feedback report
router.post('/:sessionId/feedback', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  const user_id = req.user.id;

  try {
    // Verify session belongs to user
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
      [sessionId, user_id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if feedback already exists
    const existingFeedback = await pool.query(
      'SELECT * FROM feedback_reports WHERE session_id = $1',
      [sessionId]
    );

    if (existingFeedback.rows.length > 0) {
      return res.json({ feedback: existingFeedback.rows[0] });
    }

    // Get full transcript
    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    const messages = messagesResult.rows;
    const session = sessionResult.rows[0];

    if (messages.length === 0) {
      return res.status(400).json({ error: 'No conversation to evaluate' });
    }

    // Build transcript string
    const transcriptText = messages
      .map(m => `${m.speaker === 'ai' ? 'Interviewer (Alex)' : 'Candidate'}: ${m.content}`)
      .join('\n\n');

    // Ask Groq to generate structured feedback
    const feedbackPrompt = `You are an expert interview coach. Analyze this mock behavioral interview transcript and provide detailed feedback.

INTERVIEW DETAILS:
- Role: ${session.job_role}
- Experience Level: ${session.experience_level}

TRANSCRIPT:
${transcriptText}

Provide feedback in this EXACT JSON format (no markdown, no backticks, just raw JSON):
{
  "overall_score": <number 1-10>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": [
    "<specific strength with example from the interview>",
    "<specific strength with example from the interview>",
    "<specific strength with example from the interview>"
  ],
  "improvements": [
    "<specific area to improve with actionable advice>",
    "<specific area to improve with actionable advice>",
    "<specific area to improve with actionable advice>"
  ],
  "star_usage": "<assessment of how well they used Situation-Task-Action-Result structure>",
  "communication_score": <number 1-10>,
  "content_score": <number 1-10>,
  "confidence_score": <number 1-10>,
  "top_tip": "<single most important piece of advice for their next interview>"
}`;

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'user', content: feedbackPrompt }
      ],
      max_tokens: 1000
    });

    const rawFeedback = result.choices[0].message.content;

    // Parse JSON response
    let parsedFeedback;
    try {
      const clean = rawFeedback.replace(/```json|```/g, '').trim();
      parsedFeedback = JSON.parse(clean);
    } catch {
      parsedFeedback = {
        overall_score: 7,
        summary: rawFeedback,
        strengths: ['Good communication', 'Relevant examples', 'Clear structure'],
        improvements: ['Add more specific metrics', 'Use STAR format consistently'],
        star_usage: 'Moderate use of STAR structure',
        communication_score: 7,
        content_score: 7,
        confidence_score: 7,
        top_tip: 'Practice structuring answers using the STAR method.'
      };
    }

    // Save to DB
    const feedbackResult = await pool.query(
      `INSERT INTO feedback_reports 
       (session_id, strengths, weaknesses, score, full_report_text) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        sessionId,
        JSON.stringify(parsedFeedback.strengths),
        JSON.stringify(parsedFeedback.improvements),
        parsedFeedback.overall_score,
        JSON.stringify(parsedFeedback)
      ]
    );

    res.json({ feedback: feedbackResult.rows[0], parsed: parsedFeedback });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
});

module.exports = router;