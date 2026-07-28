// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCniMbi6cJEtH0CpG1u3MnpVfel6tJPMk8",
  authDomain: "myapp-6541b.firebaseapp.com",
  projectId: "myapp-6541b",
  storageBucket: "myapp-6541b.firebasestorage.app",
  messagingSenderId: "5803219821",
  appId: "1:5803219821:web:2117efbc75fb3bbb785864",
  measurementId: "G-RWZREKNW9E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);