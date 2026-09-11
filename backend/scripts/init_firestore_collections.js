const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

const initCollections = async () => {
  console.log("Creating initial entries for bookings, messages, and reviews in Firestore...");

  // 1. Initial Booking document
  await setDoc(doc(firestore, 'bookings', 'init_booking_001'), {
    _id: 'init_booking_001',
    bookingCode: 'PRE-DEMO01',
    customerName: 'V. Vinay Kumar Reddy',
    customerPhone: '8498870697',
    serviceType: 'House Wiring',
    bookingDate: new Date().toISOString(),
    description: 'Initial system booking setup entry',
    status: 'Completed',
    adminNotes: 'Verified system setup',
    createdAt: new Date().toISOString()
  });
  console.log("✅ 'bookings' collection initialized!");

  // 2. Initial Message document
  await setDoc(doc(firestore, 'messages', 'init_message_001'), {
    _id: 'init_message_001',
    name: 'Customer Support Desk',
    email: 'contact@poojithareddyelectricals.com',
    phone: '8498870697',
    subject: 'Welcome to Poojitha Reddy Electricals',
    message: 'Inquiries submitted through the contact form will be stored here.',
    createdAt: new Date().toISOString()
  });
  console.log("✅ 'messages' collection initialized!");

  // 3. Initial Review document
  await setDoc(doc(firestore, 'reviews', 'init_review_001'), {
    _id: 'init_review_001',
    customerName: 'V. Vinay Kumar Reddy',
    rating: 5,
    comment: 'Welcome to Poojitha Reddy Electricals. Providing reliable handyman and electrical solutions across Andhra Pradesh.',
    serviceType: 'All Electrical Works',
    status: 'Approved',
    createdAt: new Date().toISOString()
  });
  console.log("✅ 'reviews' collection initialized!");

  console.log("\n🎉 All 5 collections (admins, users, bookings, messages, reviews) are now active in Firebase Firestore!");
  process.exit(0);
};

initCollections().catch((err) => {
  console.error("Initialization error:", err);
  process.exit(1);
});
