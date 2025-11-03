"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "studio-6270471985-893fe",
  "appId": "1:84753780470:web:63e654bb446338c6b766d7",
  "apiKey": "AIzaSyA-vHm0a_hpmzQYKq13u-37fdTFD4s-MV4",
  "authDomain": "studio-6270471985-893fe.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "84753780470",
  "storageBucket": "studio-6270471985-893fe.appspot.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
