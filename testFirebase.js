import { buildMatchQuestions } from './data/questions.js';

try {
  const data = buildMatchQuestions(20, 3);
  console.log("Successfully built match questions. Count:", data.length);
} catch (e) {
  console.error("Error building match questions:", e);
}
process.exit();
