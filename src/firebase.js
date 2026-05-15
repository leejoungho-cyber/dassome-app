import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBU4WCiS7E8W7pb4bjo7",
  authDomain: "dasome-companion.firebaseapp.com",
  projectId: "dasome-companion",
  storageBucket: "dasome-companion.firebasestorage.app",
  messagingSenderId: "638156716805",
  appId: "1:638156716805:web:88de1f2ac"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);