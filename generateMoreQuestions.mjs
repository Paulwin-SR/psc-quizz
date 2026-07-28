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

const extraQuestions = [
  // Kerala History & Renaissance
  { category: "കേരള ചരിത്രം", question: "പഴശ്ശിരാജയെ തോല്പിക്കാൻ ബ്രിട്ടീഷ് സൈന്യത്തെ നയിച്ചതാര്?", options: ["ആർതർ വെല്ലസ്ലി", "മാക് വാർഡൻ", "തോമസ് മൺറോ", "റോബർട്ട് ക്ലൈവ്"], answerIndex: 0 },
  { category: "കേരള ചരിത്രം", question: "ഏത് രാജാവിന്റെ കാലത്താണ് കുളച്ചൽ യുദ്ധം നടന്നത്?", options: ["മാർത്താണ്ഡവർമ്മ", "ധർമ്മരാജ", "സ്വാതി തിരുനാൾ", "ശ്രീമൂലം തിരുനാൾ"], answerIndex: 0 },
  { category: "നവോത്ഥാനം", question: "ഈഴവ ശിവപ്രതിഷ്ഠ നടന്നത് ഏത് വർഷം?", options: ["1888", "1898", "1903", "1924"], answerIndex: 0 },
  { category: "നവോത്ഥാനം", question: "ആത്മോപദേശശതകം രചിച്ചത് ആര്?", options: ["ചട്ടമ്പിസ്വാമികൾ", "ശ്രീനാരായണ ഗുരു", "കുമാരനാശാൻ", "വാഗ്ഭടാനന്ദൻ"], answerIndex: 1 },
  { category: "നവോത്ഥാനം", question: "'ജാതി കുമ്മി' എന്ന കൃതിയുടെ കർത്താവ്?", options: ["പണ്ഡിറ്റ് കറുപ്പൻ", "ശ്രീനാരായണ ഗുരു", "സഹോദരൻ അയ്യപ്പൻ", "വള്ളത്തോൾ"], answerIndex: 0 },
  
  // Indian Polity
  { category: "ഇന്ത്യൻ ഭരണഘടന", question: "ഇന്ത്യൻ ഭരണഘടനയുടെ ആമുഖം തയ്യാറാക്കിയത് ആര്?", options: ["ബി.ആർ അംബേദ്കർ", "ജവഹർലാൽ നെഹ്റു", "രാജേന്ദ്രപ്രസാദ്", "സർദാർ വല്ലഭായ് പട്ടേൽ"], answerIndex: 1 },
  { category: "ഇന്ത്യൻ ഭരണഘടന", question: "മൗലിക അവകാശങ്ങളെക്കുറിച്ച് പ്രതിപാദിക്കുന്ന ഭരണഘടനയുടെ ഭാഗം ഏത്?", options: ["ഭാഗം II", "ഭാഗം III", "ഭാഗം IV", "ഭാഗം V"], answerIndex: 1 },
  { category: "ഇന്ത്യൻ ഭരണഘടന", question: "വോട്ടവകാശത്തിനുള്ള പ്രായം 21-ൽ നിന്നും 18 ആയി കുറച്ച ഭരണഘടനാ ഭേദഗതി ഏത്?", options: ["42", "44", "61", "73"], answerIndex: 2 },
  { category: "ഇന്ത്യൻ ഭരണഘടന", question: "സ്വതന്ത്ര ഇന്ത്യയിലെ ആദ്യത്തെ വിദ്യാഭ്യാസ മന്ത്രി ആര്?", options: ["മൗലാനാ അബുൽ കലാം ആസാദ്", "ഡോ. എസ്. രാധാകൃഷ്ണൻ", "വി.വി. ഗിരി", "സർദാർ വല്ലഭായ് പട്ടേൽ"], answerIndex: 0 },

  // Geography
  { category: "ഭൂമിശാസ്ത്രം", question: "ഇന്ത്യയിലെ ഏറ്റവും വലിയ ശുദ്ധജല തടാകം ഏത്?", options: ["ചിൽക്ക", "വൂളാർ", "പുലിക്കാട്ട്", "ലോക് തക്"], answerIndex: 1 },
  { category: "ഭൂമിശാസ്ത്രം", question: "നർമ്മദ നദിയുടെ ഉദ്ഭവസ്ഥാനം എവിടെ?", options: ["അമർകണ്ഠക്", "നാസിക്", "മഹാബലേശ്വർ", "ഗംഗോത്രി"], answerIndex: 0 },
  { category: "ഭൂമിശാസ്ത്രം", question: "ഏറ്റവും കൂടുതൽ കടൽത്തീരമുള്ള ഇന്ത്യൻ സംസ്ഥാനം?", options: ["മഹാരാഷ്ട്ര", "ഗുജറാത്ത്", "തമിഴ്നാട്", "ആന്ധ്രാപ്രദേശ്"], answerIndex: 1 },
  { category: "ഭൂമിശാസ്ത്രം", question: "ഇന്ത്യയുടെ തെക്കേയറ്റം ഏത് പേരിൽ അറിയപ്പെടുന്നു?", options: ["കന്യാകുമാരി", "ഇന്ദിരാ പോയിന്റ്", "പോയിന്റ് കാലിമർ", "കവരത്തി"], answerIndex: 1 },
  
  // General Science
  { category: "സാമാന്യശാസ്ത്രം", question: "രക്തം കട്ടപിടിക്കാൻ സഹായിക്കുന്ന വിറ്റാമിൻ ഏത്?", options: ["വിറ്റാമിൻ A", "വിറ്റാമിൻ C", "വിറ്റാമിൻ K", "വിറ്റാമിൻ D"], answerIndex: 2 },
  { category: "സാമാന്യശാസ്ത്രം", question: "വൈദ്യുത പ്രതിരോധത്തിന്റെ (Resistance) യൂണിറ്റ് എന്ത്?", options: ["ആമ്പിയർ", "വോൾട്ട്", "ഓം (Ohm)", "വാട്ട്"], answerIndex: 2 },
  { category: "സാമാന്യശാസ്ത്രം", question: "മനുഷ്യ ശരീരത്തിലെ ഏറ്റവും വലിയ ഗ്രന്ഥി ഏത്?", options: ["തൈറോയ്ഡ്", "പാൻക്രിയാസ്", "കരൾ (Liver)", "പിറ്റ്യൂട്ടറി"], answerIndex: 2 },
  { category: "സാമാന്യശാസ്ത്രം", question: "സൗരയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം ഏത്?", options: ["വ്യാഴം", "ശനി", "ഭൂമി", "ശുക്രൻ"], answerIndex: 0 },
  { category: "സാമാന്യശാസ്ത്രം", question: "ആറ്റത്തിന്റെ ന്യൂക്ലിയസിൽ അടങ്ങിയിരിക്കുന്നത് എന്തെല്ലാം?", options: ["പ്രോട്ടോണും ഇലക്ട്രോണും", "പ്രോട്ടോണും ന്യൂട്രോണും", "ഇലക്ട്രോൺ മാത്രം", "ന്യൂട്രോൺ മാത്രം"], answerIndex: 1 },

  // Current Affairs & GK
  { category: "പൊതുവിജ്ഞാനം", question: "ISRO-യുടെ ആസ്ഥാനം എവിടെ?", options: ["ഹൈദരാബാദ്", "ബംഗളൂരു", "തിരുവനന്തപുരം", "ചെന്നൈ"], answerIndex: 1 },
  { category: "പൊതുവിജ്ഞാനം", question: "അർജുന അവാർഡ് ഏത് മേഖലയുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു?", options: ["സാഹിത്യം", "സംഗീതം", "കായികം", "സിനിമ"], answerIndex: 2 },
  { category: "പൊതുവിജ്ഞാനം", question: "കേരളത്തിലെ ആദ്യത്തെ ഇക്കോ-ടൂറിസം കേന്ദ്രം ഏത്?", options: ["തെന്മല", "പൊന്മുടി", "തേക്കടി", "മൂന്നാർ"], answerIndex: 0 },
  { category: "പൊതുവിജ്ഞാനം", question: "ഐക്യരാഷ്ട്രസഭയുടെ (UN) ആസ്ഥാനം എവിടെ?", options: ["ജെനീവ", "ന്യൂയോർക്ക്", "പാരീസ്", "ലണ്ടൻ"], answerIndex: 1 },
  { category: "പൊതുവിജ്ഞാനം", question: "ലോക പരിസ്ഥിതി ദിനം എന്ന് ആചരിക്കുന്നു?", options: ["ജൂൺ 5", "ജൂലൈ 11", "ഏപ്രിൽ 22", "മാർച്ച് 22"], answerIndex: 0 }
];

async function generateQuestions() {
    try {
        console.log("Uploading extra generated questions...");
        const batch = writeBatch(db);
        const colRef = collection(db, "questions");

        let count = 0;
        extraQuestions.forEach(q => {
            const docRef = doc(colRef);
            batch.set(docRef, q);
            count++;
        });

        await batch.commit();
        console.log(`Successfully uploaded ${count} extra questions!`);
        process.exit(0);
    } catch (err) {
        console.error("Error uploading: ", err);
        process.exit(1);
    }
}

generateQuestions();
