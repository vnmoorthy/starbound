import { simulate, summary } from '../lib/simulation/engine.ts';
import fs from 'node:fs';
const arg = process.argv[2];
try {
  const input = arg
    ? JSON.parse(arg.startsWith('{') ? arg : fs.readFileSync(arg, 'utf8'))
    : {};
  const result = simulate(input);
  console.log(
    JSON.stringify(
      process.argv.includes('--full') ? result : summary(result),
      null,
      2,
    ),
  );
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
