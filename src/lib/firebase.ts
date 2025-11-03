"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// WARNING: This is a public configuration. Do not store sensitive data here.
const firebaseConfig = {
    "projectId": "studio-6270471985-893fe",
    "appId": "1:84753780470:web:63e654bb446338c6b766d7",
    "storageBucket": "studio-6270471985-893fe.appspot.com",
    "apiKey": "AIzaSyB-iZpbYMkCJGw7A5TgfIyAMJ3N9dLKBwU",
    "authDomain": "studio-6270471985-893fe.firebaseapp.com",
    "messagingSenderId": "84753780470"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
