import { Request, Response } from 'express';
import { pool } from '../db/index.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_AI_KEY });

export const getAllRetreats = async (req: Request, res: Response): Promise<void> => {
  const { country, ayurveda_type } = req.query;

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (typeof country === 'string') {
    values.push(country);
    conditions.push(`country ILIKE $${values.length}`);
  }
  if (typeof ayurveda_type === 'string') {
    values.push(ayurveda_type);
    conditions.push(`ayurveda_type ILIKE $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT DISTINCT ON (name) * FROM retreats ${where} ORDER BY name, price_usd ASC`,
    values
  );
  res.json(result.rows);
};

export const getRetreatById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM retreats WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Retreat not found' });
    return;
  }

  res.json(result.rows[0]);
};

export const getRetreatAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { check_in, check_out } = req.query;

  // Single query — all room variants for this retreat
  const roomsResult = await pool.query(
    `SELECT r2.id, r2.room_type, r2.price_usd, r2.duration_days, r2.ayurveda_type, r2.name
     FROM retreats r1
     JOIN retreats r2 ON r2.name = r1.name
     WHERE r1.id = $1
     ORDER BY r2.price_usd`,
    [id]
  );

  if (roomsResult.rows.length === 0) {
    res.status(404).json({ error: 'Retreat not found' });
    return;
  }

  const retreatName = roomsResult.rows[0].name;
  const roomIds = roomsResult.rows.map(r => r.id);

  // No dates — return null availability
  const hasValidDates =
    typeof check_in === 'string' &&
    typeof check_out === 'string' &&
    check_in &&
    check_out;

  if (!hasValidDates) {
    res.json({
      retreat_name: retreatName,
      check_in: null,
      check_out: null,
      rooms: roomsResult.rows.map(r => ({ ...r, available: null }))
    });
    return;
  }

  // Date sanity check
  if (new Date(check_out as string) <= new Date(check_in as string)) {
    res.status(400).json({ error: 'check_out must be after check_in' });
    return;
  }

  // Check which room ids are already booked in this window
  const bookedResult = await pool.query(
    `SELECT retreat_id FROM bookings
     WHERE retreat_id = ANY($1)
       AND status = 'confirmed'
       AND check_in  < $3
       AND check_out > $2`,
    [roomIds, check_in, check_out]
  );

  const bookedIds = new Set(bookedResult.rows.map(r => r.retreat_id));

  res.json({
    retreat_name: retreatName,
    check_in,
    check_out,
    rooms: roomsResult.rows.map(r => ({
      ...r,
      available: !bookedIds.has(r.id)
    }))
  });
};

// export const recommendRetreats = async (req: Request, res: Response): Promise<void> => {
//   const { goal } = req.query;
//   if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
//     res.status(400).json({ error: 'Health goal is required' });
//     return;
//   }
//   // Fetch all retreats for recommendation context
//   const result = await pool.query(
//     `SELECT DISTINCT ON (name) id, name, location, country, duration_days, price_usd, ayurveda_type FROM retreats ORDER BY name, price_usd ASC`
//   );
//   const retreats = result.rows;
//   const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);
//   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//   const prompt = `You are an Ayurveda wellness expert.

// A user has this health goal: "${goal}"

// Here are the available retreats:\n${JSON.stringify(retreats, null, 2)}

// Return a JSON array of the top 3 most suitable retreats ranked by relevance.
// Each item must have:\n- retreat_id (number)\n- name (string)\n- location (string)\n- ayurveda_type (string)\n- price_usd (number)\n- reason (1-2 sentences explaining why this suits the goal)\n\nReturn ONLY valid JSON array. No markdown, no explanation outside JSON.`;
//   try {
//     const geminiResult = await model.generateContent(prompt);
//     const text = geminiResult.response.text();
//     const cleaned = text.replace(/```json|```/g, '').trim();
//     const recommendations = JSON.parse(cleaned);
//     res.json({ goal, recommendations });
//   } catch (err) {
//     console.error('Gemini recommendation error:', err);
//     // Fallback: return first three retreats
//     res.status(502).json({
//       error: 'AI recommendation unavailable',
//       fallback: retreats.slice(0, 3).map(r => ({
//         retreat_id: r.id,
//         name: r.name,
//         location: r.location,
//         ayurveda_type: r.ayurveda_type,
//         price_usd: Number(r.price_usd),
//         reason: 'Fallback recommendation'
//       }))
//     });
//   }
// };
export const recommendRetreats = async (req: Request, res: Response): Promise<void> => {
  const { goal } = req.query;

  if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
    res.status(400).json({ error: 'Health goal is required' });
    return;
  }

  const result = await pool.query(
    `SELECT DISTINCT ON (name) id, name, location, country, duration_days, price_usd, ayurveda_type,image_url 
     FROM retreats 
     ORDER BY name, price_usd ASC`
  );

  const retreats = result.rows;

  const prompt = `You are an Ayurveda wellness expert.

A user has this health goal: "${goal}"

Here are the available retreats:
${JSON.stringify(retreats, null, 2)}

Return a JSON array of the top 3 most suitable retreats ranked by relevance.
Each item must have:
- retreat_id (number)
- name (string)
- location (string)
- ayurveda_type (string)
- price_usd (number)
- image_url(string)
- reason (1-2 sentences explaining why this suits the goal)

Return ONLY valid JSON array. No markdown, no explanation outside JSON.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',  // fast + free on Groq
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,   // lower = more consistent JSON output
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const recommendations = JSON.parse(cleaned);

    res.json({ goal, recommendations });

  } catch (err) {
    console.error('Groq recommendation error:', err);
    res.status(502).json({
      error: 'AI recommendation unavailable',
      fallback: retreats.slice(0, 3).map(r => ({
        retreat_id: r.id,
        name: r.name,
        location: r.location,
        ayurveda_type: r.ayurveda_type,
        price_usd: Number(r.price_usd),
        reason: 'Fallback recommendation — AI unavailable'
      }))
    });
  }
};