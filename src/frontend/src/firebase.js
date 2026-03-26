import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDkXoluYg1t1F7Z8pP7Gt2_eoKYVLQK6J8",
  authDomain: "school-3a7d9.firebaseapp.com",
  projectId: "school-3a7d9",
  storageBucket: "school-3a7d9.firebasestorage.app",
  messagingSenderId: "34107324673",
  appId: "1:34107324673:web:0d3b8c3fc7e0e33637c300",
  measurementId: "G-PSFTYFVG3P",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
