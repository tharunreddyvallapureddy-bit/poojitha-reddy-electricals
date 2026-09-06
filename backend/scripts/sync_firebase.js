require('dotenv').config();
const mongoose = require('mongoose');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: "AIzaSyAS1K-C5J1L2wJRw2aLIIQSGrNhXnelvMo",
  authDomain: "cineverse-f20a7.firebaseapp.com",
  projectId: "cineverse-f20a7",
  storageBucket: "cineverse-f20a7.firebasestorage.app",
  messagingSenderId: "241943501972",
  appId: "1:241943501972:web:64f8c373b0cbe50c0b2881",
  measurementId: "G-14E5QFXJLE"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const sync = async () => {
  console.log("Starting Firebase data sync...");

  let mongoData = { users: [], admins: [], bookings: [], reviews: [], messages: [] };

  try {
    if (process.env.MONGODB_URI) {
      console.log("Connecting to MongoDB Atlas...");
      await mongoose.connect(process.env.MONGODB_URI);
      const db = mongoose.connection.db;

      mongoData.users = await db.collection('users').find({}).toArray();
      mongoData.admins = await db.collection('admins').find({}).toArray();
      mongoData.bookings = await db.collection('bookings').find({}).toArray();
      mongoData.reviews = await db.collection('reviews').find({}).toArray();
      mongoData.messages = await db.collection('messages').find({}).toArray();

      console.log(`Fetched from MongoDB: ${mongoData.users.length} users, ${mongoData.admins.length} admins, ${mongoData.bookings.length} bookings, ${mongoData.reviews.length} reviews, ${mongoData.messages.length} messages.`);
    }
  } catch (err) {
    console.log("MongoDB connection failed or skipped. Checking local fallback JSON file...");
  }

  // Also check local database_fallback.json
  const fallbackPath = path.join(__dirname, '../database_fallback.json');
  let fallbackData = { users: [], admins: [], bookings: [], reviews: [], messages: [] };
  if (fs.existsSync(fallbackPath)) {
    try {
      fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    } catch (e) {}
  }

  // Combine datasets by stringifying IDs
  const collections = ['users', 'admins', 'bookings', 'reviews', 'messages'];
  
  for (const colName of collections) {
    const items = [...(mongoData[colName] || []), ...(fallbackData[colName] || [])];
    console.log(`Uploading ${items.length} items to Firebase Firestore collection '${colName}'...`);
    
    for (const item of items) {
      const docId = String(item._id || Math.random().toString(36).substring(2, 11));
      const cleanItem = JSON.parse(JSON.stringify(item));
      cleanItem._id = docId;
      if (cleanItem.userId) cleanItem.userId = String(cleanItem.userId);

      await setDoc(doc(firestore, colName, docId), cleanItem);
    }
  }

  console.log("✅ All data synced to Firebase Firestore successfully!");
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  process.exit(0);
};

sync().catch((err) => {
  console.error("Firebase sync error:", err);
  process.exit(1);
});
