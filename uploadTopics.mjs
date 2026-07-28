import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import { TOPICS as existingTopics } from './data/topics.js';

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

const extraTopics = [
  {
    id: "indian-history",
    title: "ഇന്ത്യൻ ചരിത്രം (Indian History)",
    icon: "library-outline",
    color: "#F59E0B",
    content: [
      "സിന്ധുനദീതട സംസ്കാരം കണ്ടെത്തിയത് ദയാറാം സാഹ്നി ആണ് (1921).",
      "ഇന്ത്യൻ നാഷണൽ കോൺഗ്രസ് സ്ഥാപിച്ചത് 1885-ൽ A.O. ഹ്യൂം ആണ്.",
      "ജാലിയൻ വാലാബാഗ് കൂട്ടക്കൊല നടന്നത് 1919 ഏപ്രിൽ 13-നാണ്.",
      "ക്വിറ്റ് ഇന്ത്യാ സമരം ആരംഭിച്ചത് 1942 ഓഗസ്റ്റ് 8-നാണ്.",
      "ഒന്നാം സ്വാതന്ത്ര്യ സമരം (ശിപായി ലഹള) നടന്നത് 1857-ൽ മീററ്റിലാണ്.",
      "ഗാന്ധിജി ഇന്ത്യയിൽ നടത്തിയ ആദ്യ സത്യാഗ്രഹം ചമ്പാരനിലാണ് (1917).",
      "ബംഗാൾ വിഭജനം നടന്നത് 1905-ൽ കഴ്സൺ പ്രഭുവിന്റെ കാലത്താണ്."
    ]
  },
  {
    id: "economics",
    title: "സാമ്പത്തിക ശാസ്ത്രം (Economics)",
    icon: "stats-chart-outline",
    color: "#10B981",
    content: [
      "ഇന്ത്യൻ സാമ്പത്തിക ശാസ്ത്രത്തിന്റെ പിതാവ് പി.വി. നരസിംഹറാവു ആണ് (പരിഷ്കാരങ്ങൾ). എന്നാൽ സ്വതന്ത്ര ഇന്ത്യയിലെ ആദ്യ ബജറ്റ് അവതരിപ്പിച്ചത് ആർ. കെ. ഷണ്മുഖം ചെട്ടി ആണ്.",
      "പഞ്ചവത്സര പദ്ധതികൾ ആരംഭിച്ചത് 1951-ലാണ്.",
      "റിസർവ് ബാങ്ക് ഓഫ് ഇന്ത്യ (RBI) 1935 ഏപ്രിൽ 1-ന് സ്ഥാപിതമായി.",
      "ഇന്ത്യയിൽ ബാങ്കുകളുടെ ദേശസാൽക്കരണം ആദ്യമായി നടന്നത് 1969-ലാണ് (14 ബാങ്കുകൾ).",
      "നീതി ആയോഗിന്റെ അധ്യക്ഷൻ എപ്പോഴും ഇന്ത്യൻ പ്രധാനമന്ത്രിയായിരിക്കും.",
      "GST (ചരക്ക് സേവന നികുതി) ഇന്ത്യയിൽ നിലവിൽ വന്നത് 2017 ജൂലൈ 1-നാണ്."
    ]
  },
  {
    id: "literature",
    title: "മലയാള സാഹിത്യം (Malayalam Lit)",
    icon: "book-outline",
    color: "#3B82F6",
    content: [
      "മലയാള ഭാഷയുടെ പിതാവ് തുഞ്ചത്ത് രാമാനുജൻ എഴുത്തച്ഛനാണ്.",
      "ആദ്യത്തെ മലയാള ലക്ഷണമൊത്ത നോവൽ ഒ. ചന്തുമേനോന്റെ 'ഇന്ദുലേഖ' (1889) ആണ്.",
      "ജ്ഞാനപീഠ പുരസ്കാരം ലഭിച്ച ആദ്യ മലയാളി ജി. ശങ്കരക്കുറുപ്പാണ് (ഓടക്കുഴൽ).",
      "കേരള വാൽമീകി എന്നറിയപ്പെടുന്നത് വള്ളത്തോൾ നാരായണമേനോനാണ്.",
      "ആശാൻ സ്മാരകം സ്ഥിതി ചെയ്യുന്നത് തോന്നയ്ക്കലാണ് (തിരുവനന്തപുരം).",
      "ബാലാമണിയമ്മയെ മലയാളത്തിലെ മാതൃത്വത്തിന്റെ കവി എന്ന് വിളിക്കുന്നു."
    ]
  }
];

async function uploadTopics() {
    try {
        console.log("Uploading topics...");
        const allTopics = [...existingTopics, ...extraTopics];
        
        const batch = writeBatch(db);
        const colRef = collection(db, "topics");

        allTopics.forEach(t => {
            // Using set with specific ID makes it easy to fetch/update
            const docRef = doc(colRef, t.id);
            batch.set(docRef, t);
        });

        await batch.commit();
        console.log(`Successfully uploaded ${allTopics.length} topics!`);
        process.exit(0);
    } catch (err) {
        console.error("Error uploading topics: ", err);
        process.exit(1);
    }
}

uploadTopics();
