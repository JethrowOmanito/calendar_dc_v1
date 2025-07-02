import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD6oDmf0emKp-nuuilV9JwA5tbGtxfF8N0",
  authDomain: "calendardc-3fe9a.firebaseapp.com",
  projectId: "calendardc-3fe9a",
  storageBucket: "calendardc-3fe9a.appspot.com",
  messagingSenderId: "830328826323",
  appId: "1:830328826323:web:7d3c0a18e3111c8ec72726",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app); // Firestore instance
const storage = getStorage(app);

export { auth, firestore, storage }; // Export firestore