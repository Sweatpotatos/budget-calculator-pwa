import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc } from "firebase/firestore";

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

export { db, collection, addDoc, getDocs, setDoc, doc };