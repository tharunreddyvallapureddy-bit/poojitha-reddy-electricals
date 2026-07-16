require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');
const Admin = require('../models/Admin');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Message = require('../models/Message');

const seed = async () => {
  console.log('Starting production database setup...');
  
  // Connect to Database
  await connectDB();

  try {
    // Seed Admin (Required for initial login)
    const adminUsername = 'admin';
    const adminPassword = 'Vinay@8498870697';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Remove existing admin if any
    await Admin.deleteOne({ username: adminUsername });
    
    // Create new admin
    await Admin.create({
      username: adminUsername,
      password: hashedPassword,
    });
    
    console.log(`Production Admin account created successfully:`);
    console.log(`Username: '${adminUsername}'`);
    console.log(`Password: '${adminPassword}'`);
    console.log('-----------------------------------');
    console.log('Database is ready for clean production use (no example data seeded).');
    
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seed();
