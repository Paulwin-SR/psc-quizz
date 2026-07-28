import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, writeBatch, doc } from "firebase/firestore";

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

// Generate 30 days of historical data
const historicalAffairs = [];
const today = new Date();

for (let i = 1; i <= 30; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  
  // Create some varied PSC relevant topics based on the day
  let title = "";
  let category = "";
  
  if (i % 5 === 0) {
    title = `ISRO successfully launches new Earth Observation Satellite on ${date.toLocaleDateString()}`;
    category = "Science & Tech";
  } else if (i % 4 === 0) {
    title = `Kerala Government announces new welfare scheme for farmers.`;
    category = "Kerala State";
  } else if (i % 3 === 0) {
    title = `Reserve Bank of India updates repo rate in latest monetary policy meeting.`;
    category = "Economy";
  } else if (i % 2 === 0) {
    title = `India wins multiple gold medals in Asian Athletics Championship.`;
    category = "Sports";
  } else {
    title = `Prime Minister inaugurates new infrastructure projects across the nation.`;
    category = "National";
  }

  historicalAffairs.push({
    title,
    category,
    pubDate: date.toISOString(),
    link: "https://www.thehindu.com"
  });
}

async function uploadAffairs() {
  try {
    console.log("Uploading historical current affairs...");
    const batch = writeBatch(db);
    const colRef = collection(db, "current_affairs");

    historicalAffairs.forEach(item => {
      const docRef = doc(colRef);
      batch.set(docRef, item);
    });

    await batch.commit();
    console.log(`Successfully uploaded ${historicalAffairs.length} historical records!`);
    process.exit(0);
  } catch (err) {
    console.error("Error uploading:", err);
    process.exit(1);
  }
}

uploadAffairs();
