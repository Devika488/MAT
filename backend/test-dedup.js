import { RetreatsService } from './src/services/retreats.service.js';
import 'dotenv/config';

async function test() {
  const retreats = await RetreatsService.getAllRetreats();
  console.log(JSON.stringify(retreats, null, 2));
  process.exit(0);
}

test();
