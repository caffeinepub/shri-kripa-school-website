import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD__UQJeFqJkvhXmDF88Kyql9XyW1MFdao",
  authDomain: "shri-kripa.firebaseapp.com",
  projectId: "shri-kripa",
  storageBucket: "shri-kripa.firebasestorage.app",
  messagingSenderId: "684576087073",
  appId: "1:684576087073:web:d5c41e675548bd6709d760",
  measurementId: "G-3TNQR36BXK",
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
