import { Request, Response } from 'express';
import sql from '../db/index.js';
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
  const result = await sql.unsafe(
    `SELECT DISTINCT ON (name) * FROM retreats ${where} ORDER BY name, price_usd ASC`,
    values as any[]
  );
  res.json(result);
};

export const getRetreatById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const result = await sql`SELECT * FROM retreats WHERE id = ${id}`;

  if (result.length === 0) {
    res.status(404).json({ error: 'Retreat not found' });
    return;
  }

  res.json(result[0]);
};

export const getRetreatAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { check_in, check_out } = req.query;

  // Single query — all room variants for this retreat
  const roomsResult = await sql`
    SELECT r2.id, r2.room_type, r2.price_usd, r2.duration_days, r2.ayurveda_type, r2.name
    FROM retreats r1
    JOIN retreats r2 ON r2.name = r1.name
    WHERE r1.id = ${id}
    ORDER BY r2.price_usd
  `;

  if (roomsResult.length === 0) {
    res.status(404).json({ error: 'Retreat not found' });
    return;
  }

  const retreatName = roomsResult[0].name;
  const roomIds = roomsResult.map(r => r.id);

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
      rooms: roomsResult.map(r => ({ ...r, available: null }))
    });
    return;
  }

  // Date sanity check
  if (new Date(check_out as string) <= new Date(check_in as string)) {
    res.status(400).json({ error: 'check_out must be after check_in' });
    return;
  }

  // Check which room ids are already booked in this window
  const bookedResult = await sql`
    SELECT retreat_id FROM bookings
    WHERE retreat_id = ANY(${roomIds})
      AND status = 'confirmed'
      AND check_in  < ${check_out}
      AND check_out > ${check_in}
  `;

  const bookedIds = new Set(bookedResult.map(r => r.retreat_id));

  res.json({
    retreat_name: retreatName,
    check_in,
    check_out,
    rooms: roomsResult.map(r => ({
      ...r,
      available: !bookedIds.has(r.id)
    }))
  });
};

export const recommendRetreats = async (req: Request, res: Response): Promise<void> => {
  const { goal } = req.query;

  if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
    res.status(400).json({ error: 'Health goal is required' });
    return;
  }

  const result = await sql`
    SELECT DISTINCT ON (name) id, name, location, country, duration_days, price_usd, ayurveda_type, image_url
    FROM retreats
    ORDER BY name, price_usd ASC
  `;

  const retreats = result;

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
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
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