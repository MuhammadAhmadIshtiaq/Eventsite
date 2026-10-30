const db = require('../config/db');
const { registrationsTotal, activeUsersGauge } = require('../routes/metricsRoutes');

async function getAllEvents(req, res) {
  try {
    const result = await db.query(
      'SELECT id, title, category, description, team_size_min, team_size_max, registration_fee, prize_pool, venue, event_date, icon FROM events ORDER BY id ASC'
    );
    activeUsersGauge.set(result.rows.length);
    return res.json({ events: result.rows });
  } catch (err) {
    console.error('Error fetching events:', err);
    return res.status(500).json({ error: 'Failed to retrieve competitions.' });
  }
}

async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Competition not found.' });
    }
    return res.json({ event: result.rows[0] });
  } catch (err) {
    console.error('Error fetching event by id:', err);
    return res.status(500).json({ error: 'Failed to retrieve competition details.' });
  }
}

async function registerForEvent(req, res) {
  try {
    const { event_id, team_name, leader_name, leader_email, leader_phone, members } = req.body;
    const userId = req.user.id;

    if (!event_id || !team_name || !leader_name || !leader_email || !leader_phone) {
      return res.status(400).json({ error: 'All fields (event, team name, leader details) are required.' });
    }

    // Check if event exists
    const eventResult = await db.query('SELECT * FROM events WHERE id = $1', [event_id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Selected competition does not exist.' });
    }
    const event = eventResult.rows[0];

    // Check if already registered
    const existing = await db.query(
      'SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2',
      [userId, event_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You have already registered for this competition.' });
    }

    const membersString = Array.isArray(members) ? JSON.stringify(members) : (members || '');

    const insertResult = await db.query(
      `INSERT INTO registrations (user_id, event_id, team_name, leader_name, leader_email, leader_phone, members, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONFIRMED')
       RETURNING id, team_name, leader_name, leader_email, status, registered_at`,
      [userId, event_id, team_name.trim(), leader_name.trim(), leader_email.trim(), leader_phone.trim(), membersString]
    );

    // Increment Prometheus counter
    try {
      registrationsTotal.inc({ event_category: event.category });
    } catch (e) {
      // ignore metrics increment failure
    }

    return res.status(201).json({
      message: `Registration confirmed for ${event.title}!`,
      registration: insertResult.rows[0],
      event_title: event.title,
    });
  } catch (err) {
    console.error('Error registering for event:', err);
    return res.status(500).json({ error: 'Failed to complete registration.' });
  }
}

async function getMyRegistrations(req, res) {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT r.id, r.team_name, r.leader_name, r.leader_email, r.leader_phone, r.members, r.status, r.registered_at,
              e.title AS event_title, e.category AS event_category, e.venue, e.event_date, e.prize_pool
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = $1
       ORDER BY r.registered_at DESC`,
      [userId]
    );
    return res.json({ registrations: result.rows });
  } catch (err) {
    console.error('Error fetching user registrations:', err);
    return res.status(500).json({ error: 'Failed to fetch your registrations.' });
  }
}

async function getStats(req, res) {
  try {
    const eventsCount = await db.query('SELECT COUNT(*) FROM events');
    const regCount = await db.query('SELECT COUNT(*) FROM registrations');
    const usersCount = await db.query('SELECT COUNT(*) FROM users');

    return res.json({
      competitions: parseInt(eventsCount.rows[0].count, 10),
      registrations: parseInt(regCount.rows[0].count, 10),
      students: parseInt(usersCount.rows[0].count, 10),
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  registerForEvent,
  getMyRegistrations,
  getStats,
};

