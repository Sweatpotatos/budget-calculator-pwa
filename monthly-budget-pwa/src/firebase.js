import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc, enableIndexedDbPersistence, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCg7xzeSJO7BtZgmetFzLHfRruhcDDISBI",
    authDomain: "budget-calculator-13b20.firebaseapp.com",
    projectId: "budget-calculator-13b20",
    storageBucket: "budget-calculator-13b20.firebasestorage.app",
    messagingSenderId: "913412660495",
    appId: "1:913412660495:web:cde3287ddd79827db0327a",
    measurementId: "G-Z2MR16FYB4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable Firestore offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open—persistence can only be enabled in one tab at a time.
      console.error("Persistence failed (multiple tabs open):", err);
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all features required to enable persistence
      console.error("Persistence is not available:", err);
    }
  });

export { db, collection, addDoc, getDocs, setDoc, doc, onSnapshot };