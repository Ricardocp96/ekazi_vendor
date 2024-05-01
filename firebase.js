// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmXERVl_8ZqDB2upoBuHdo4ZsFdftyAQs",
  authDomain: "ekazi-e2d1f.firebaseapp.com",
  projectId: "ekazi-e2d1f",
  storageBucket: "ekazi-e2d1f.appspot.com",
  messagingSenderId: "89859785541",
  appId: "1:89859785541:web:cfc67b293670d896b4342c",
  measurementId: "G-NMPWLW010E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {experimentalForceLongPolling: true});
const analytics = getAnalytics(app);

export { db, auth };
