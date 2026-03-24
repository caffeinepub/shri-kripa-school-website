import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAikLNyII1qcx6zkD50PWEaAwR4y0k2nUM",
  authDomain: "shri-kripa-a9fc8.firebaseapp.com",
  projectId: "shri-kripa-a9fc8",
  storageBucket: "shri-kripa-a9fc8.firebasestorage.app",
  messagingSenderId: "943363021489",
  appId: "1:943363021489:web:03a7d0df6241aba0fd6090",
  measurementId: "G-V7Z2LJ87TE",
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
