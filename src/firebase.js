import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "목사님 Firebase apiKey",
  authDomain: "dasome-platform.firebaseapp.com",
  projectId: "dasome-platform",
  storageBucket: "dasome-platform.firebasestorage.app",
  messagingSenderId: "670405525258",
  appId: "목사님 Firebase appId",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);