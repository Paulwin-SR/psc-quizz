import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, writeBatch, doc } from "firebase/firestore";

// Read questions from data file
// Need to do this carefully if it's an ES Module without an extension, but Node might just work.
import { QUESTIONS } from './data/questions.js';

const firebaseConfig = {
  apiKey: "AIzaSyCniMbi6cJEtH0CpG1u3MnpVfel6tJPMk8",
  authDomain: "myapp-6541b.firebaseapp.com",
  projectId: "myapp-6541b",
  storageBucket: "myapp-6541b.firebasestorage.app",
  messagingSenderId: "5803219821",
  appId: "1:5803219821:web:2117efbc75fb3bbb785864",
  measurementId: "G-RWZREKNW9E"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function parseRawQuestions(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const questions = [];
    let currentQuestion = null;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Match "1. Question text"
        const qMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (qMatch) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                category: "സാമാന്യശാസ്ത്രം / പൊതുവിജ്ഞാനം", 
                question: qMatch[2],
                options: [],
                answerIndex: 0
            };
            continue;
        }

        if (currentQuestion) {
            if (line.startsWith("Answer :")) {
                const ans = line.split(":")[1].trim(); // A, B, C, D
                currentQuestion.answerIndex = ans === 'A' ? 0 : ans === 'B' ? 1 : ans === 'C' ? 2 : 3;
            } else if (line.match(/^[A-D]\)/)) {
                // Regex to split line "A) opt1 B) opt2"
                const optRegex = /([A-D])\)\s+(.*?)(?=\s+[A-D]\)|\s*$)/g;
                let match;
                while ((match = optRegex.exec(line)) !== null) {
                    currentQuestion.options.push(match[2].trim());
                }
            }
        }
    }
    if (currentQuestion) {
        questions.push(currentQuestion);
    }
    return questions;
}

async function upload() {
    try {
        console.log("Parsing raw questions...");
        const rawText = fs.readFileSync('/home/trivand/.gemini/antigravity-ide/brain/56f4ac77-4ed0-4b6c-902e-d7164ffdb70e/scratch/raw_questions.txt', 'utf8');
        const extraQuestions = parseRawQuestions(rawText);
        
        console.log(`Parsed ${extraQuestions.length} extra questions.`);
        
        const allQuestions = [...QUESTIONS, ...extraQuestions];
        console.log(`Total questions to upload: ${allQuestions.length}`);

        // We will create individual requests or batches
        let count = 0;
        const colRef = collection(db, "questions");

        // Firebase web SDK batching can be tricky if we hit permission errors. 
        // Let's just do individual addDoc or chunked Promise.all for simplicity.
        const chunked = [];
        for (let i = 0; i < allQuestions.length; i += 20) {
            chunked.push(allQuestions.slice(i, i + 20));
        }

        for (const chunk of chunked) {
            const promises = chunk.map(q => addDoc(colRef, q));
            await Promise.all(promises);
            count += chunk.length;
            console.log(`Uploaded ${count} / ${allQuestions.length} documents...`);
        }

        console.log("Upload complete!");
        process.exit(0);
    } catch (err) {
        console.error("Error uploading: ", err);
        process.exit(1);
    }
}

upload();
