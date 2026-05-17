import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAMS-QSYjjCz8uPufU-oRwKQHM_jz5Dy8",
  authDomain: "dasome-platform.firebaseapp.com",
  projectId: "dasome-platform",
  storageBucket: "dasome-platform.firebasestorage.app",
  messagingSenderId: "670405525258",
  appId: "1:670405525258:web:3a8c39ed3f29c984c044f3",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);