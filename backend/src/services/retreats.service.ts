import sql from '../db/index.js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_AI_KEY });

export class RetreatsService {
  static async getAllRetreats(country?: string, ayurveda_type?: string) {
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
    return await sql.unsafe(
      `SELECT DISTINCT ON (name, location, ayurveda_type) * FROM retreats ${where} ORDER BY name, location, ayurveda_type, price_usd ASC`,
      values as any[]
    );
  }

  static async getRetreatById(id: string) {
    const result = await sql`SELECT * FROM retreats WHERE id = ${id}`;
    return result.length > 0 ? result[0] : null;
  }

  static async getRetreatAvailability(id: string, check_in?: string, check_out?: string) {
    // Single query — all room variants for this retreat
    const roomsResult = await sql`
      SELECT r2.id, r2.room_type, r2.price_usd, r2.duration_days, r2.ayurveda_type, r2.name
      FROM retreats r1
      JOIN retreats r2 ON r2.name = r1.name
      WHERE r1.id = ${id}
      ORDER BY r2.price_usd
    `;

    if (roomsResult.length === 0) return null;

    const retreatName = roomsResult[0].name;
    const roomIds = roomsResult.map(r => r.id);

    const hasValidDates = check_in && check_out;

    if (!hasValidDates) {
      return {
        retreat_name: retreatName,
        check_in: null,
        check_out: null,
        rooms: roomsResult.map(r => ({ ...r, available: null }))
      };
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

    return {
      retreat_name: retreatName,
      check_in,
      check_out,
      rooms: roomsResult.map(r => ({
        ...r,
        available: !bookedIds.has(r.id)
      }))
    };
  }

  static async recommendRetreats(goal: string) {
    const result = await sql`
      SELECT DISTINCT ON (name, location, ayurveda_type) id, name, location, country, duration_days, price_usd, ayurveda_type, image_url
      FROM retreats
      ORDER BY name, location, ayurveda_type, price_usd ASC
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

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  }
}
