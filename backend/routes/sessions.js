const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// START a new session
router.post('/start', authenticateToken, async (req, res) => {
  const { job_role, experience_level, job_description } = req.body;
  const user_id = req.user.id;

  if (!job_role || !experience_level) {
    return res.status(400).json({ error: 'Job role and experience level are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO sessions (user_id, job_role, experience_level, job_description, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [user_id, job_role, experience_level, job_description || null]
    );

    res.status(201).json({ session: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET all sessions for logged-in user (for dashboard)
router.get('/history', authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT s.*, f.score, f.full_report_text
       FROM sessions s
       LEFT JOIN feedback_reports f ON f.session_id = s.id
       WHERE s.user_id = $1
       ORDER BY s.started_at DESC`,
      [user_id]
    );

    // Parse score from full_report_text if score column is null
    const sessions = result.rows.map(row => {
      if (!row.score && row.full_report_text) {
        try {
          const parsed = JSON.parse(row.full_report_text);
          row.score = parsed.overall_score;
        } catch {}
      }
      return row;
    });

    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET single session with messages
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
      [id]
    );

    const feedbackResult = await pool.query(
      'SELECT * FROM feedback_reports WHERE session_id = $1',
      [id]
    );

    res.json({
      session: sessionResult.rows[0],
      messages: messagesResult.rows,
      feedback: feedbackResult.rows[0] || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

module.exports = router;