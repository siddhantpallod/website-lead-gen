// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBfJQRSm2kDKxwaYjtjTyOFiQ3UzFPIwAw",
  authDomain: "leadgenai-d2449.firebaseapp.com",
  projectId: "leadgenai-d2449",
  storageBucket: "leadgenai-d2449.firebasestorage.app",
  messagingSenderId: "845717214982",
  appId: "1:845717214982:web:5dfccbd0b7e5f681043087",
  measurementId: "G-XWP3LL44QQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;