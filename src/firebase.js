// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBXyUeiBYDTrZOo-kaLlrKrhbzGyjCdT9w",

  authDomain: "chatopia-b303d.firebaseapp.com",

  projectId: "chatopia-b303d",

  storageBucket: "chatopia-b303d.firebasestorage.app",

  messagingSenderId: "494218784527",

  appId: "1:494218784527:web:3863541c26954fd113187a",

  measurementId: "G-R8P2LNR42X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
