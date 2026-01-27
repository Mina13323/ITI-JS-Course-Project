// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Your Firebase configuration
// Your Firebase configuration
const firebaseConfig = window.FIREBASE_CONFIG;
if (!firebaseConfig) {
  console.error("Firebase config not found! Make sure shared/env.js is loaded.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export everything needed
export {
  addDoc,
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
};

console.log("Firebase initialized!");
