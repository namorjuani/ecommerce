// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDpOBiQvaAdKv3xay93o_BOAPJqwvfz0Ms",
  authDomain: "applavaderoartesanal.firebaseapp.com",
  projectId: "applavaderoartesanal",
  storageBucket: "applavaderoartesanal.appspot.com",
  messagingSenderId: "805649099589",
  appId: "1:805649099589:web:40c7c7d89eb6cf96ba6c2c",
  measurementId: "G-YCJ3M38TVH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
