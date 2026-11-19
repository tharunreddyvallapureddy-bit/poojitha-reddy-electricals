import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAS1K-C5J1L2wJRw2aLIIQSGrNhXnelvMo",
  authDomain: "cineverse-f20a7.firebaseapp.com",
  projectId: "cineverse-f20a7",
  storageBucket: "cineverse-f20a7.firebasestorage.app",
  messagingSenderId: "241943501972",
  appId: "1:241943501972:web:64f8c373b0cbe50c0b2881",
  measurementId: "G-14E5QFXJLE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, db, analytics };
