const API_URL = 'https://poojitha-reddy-electricals-backend.onrender.com';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const config = { ...options, headers };
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log("===============================================================");
  console.log("🛠️ POOJITHA REDDY ELECTRICALS - FULL SYSTEM TEST");
  console.log(`Target: ${API_URL}`);
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // Generate unique test user
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testUser = {
    name: `Test Customer ${randomSuffix}`,
    email: `customer_${randomSuffix}@testpre.com`,
    phone: `98765${randomSuffix}`,
    password: `Pass@${randomSuffix}`
  };

  console.log("---------------------------------------------------------------");
  console.log("PART 1: CUSTOMER USER WORKFLOW TEST");
  console.log("---------------------------------------------------------------");

  // 1. User Registration
  console.log("1. Testing User Registration...");
  const regRes = await request('/api/auth/user/register', {
    method: 'POST',
    body: testUser
  });
  assert(regRes.status === 201 && regRes.data.token, `User registered: ${testUser.email}`);
  let userToken = regRes.data.token;
  const userId = regRes.data._id;

  // 2. User Login
  console.log("\n2. Testing User Login...");
  const loginRes = await request('/api/auth/user/login', {
    method: 'POST',
    body: { email: testUser.email, password: testUser.password }
  });
  assert(loginRes.status === 200 && loginRes.data.token, `User logged in successfully`);

  // 3. Get User Profile
  console.log("\n3. Testing Get User Profile...");
  const profileRes = await request('/api/auth/user/profile', {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert(profileRes.status === 200 && profileRes.data.email === testUser.email, `Fetched profile for ${profileRes.data.name}`);

  // 4. Update Profile with Address & Notification Preferences
  console.log("\n4. Testing Update Profile (Address & Notifications)...");
  const updateProfileRes = await request('/api/auth/user/profile', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${userToken}` },
    body: {
      name: `${testUser.name} Updated`,
      phone: testUser.phone,
      address: {
        street: 'Door 2-61, Main Road',
        landmark: 'Near Shiva Temple',
        villageTown: 'Nallaballe, Muddanur',
        district: 'YSR Kadapa',
        state: 'Andhra Pradesh',
        pincode: '516380'
      },
      notifications: {
        bookingUpdates: true,
        handymanArrival: true,
        promotions: false
      }
    }
  });
  assert(
    updateProfileRes.status === 200 && 
    updateProfileRes.data.address.villageTown === 'Nallaballe, Muddanur' &&
    updateProfileRes.data.notifications.bookingUpdates === true,
    `Address and notifications successfully updated and saved`
  );

  // 5. Change Password
  console.log("\n5. Testing Password Change...");
  const newPassword = `NewPass@${randomSuffix}!`;
  const changePwdRes = await request('/api/auth/user/change-password', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${userToken}` },
    body: {
      currentPassword: testUser.password,
      newPassword: newPassword
    }
  });
  assert(changePwdRes.status === 200, `Password changed with current password verification`);

  // 6. Login with New Password
  console.log("\n6. Testing Login with New Password...");
  const newLoginRes = await request('/api/auth/user/login', {
    method: 'POST',
    body: { email: testUser.email, password: newPassword }
  });
  assert(newLoginRes.status === 200, `Successfully authenticated with changed password`);
  userToken = newLoginRes.data.token;

  // 7. Forgot Password OTP generation
  console.log("\n7. Testing Forgot Password Code Generation...");
  const forgotRes = await request('/api/auth/user/forgot-password', {
    method: 'POST',
    body: { email: testUser.email }
  });
  assert(forgotRes.status === 200, `Reset verification code requested for ${testUser.email}`);
  const otpCode = forgotRes.data.devCode;

  // 8. Reset Password with OTP Code
  if (otpCode) {
    console.log(`\n8. Testing Reset Password with 6-digit Code (${otpCode})...`);
    const finalPassword = `FinalPass@${randomSuffix}99`;
    const resetRes = await request('/api/auth/user/reset-password', {
      method: 'POST',
      body: {
        email: testUser.email,
        code: otpCode,
        newPassword: finalPassword
      }
    });
    assert(resetRes.status === 200, `Password reset verified with 6-digit code`);

    // Verify login with final password
    const finalLogin = await request('/api/auth/user/login', {
      method: 'POST',
      body: { email: testUser.email, password: finalPassword }
    });
    assert(finalLogin.status === 200, `Logged in with OTP reset password`);
    userToken = finalLogin.data.token;
  } else {
    console.log("\n8. Skipping OTP verification code step (running on remote without devCode echo)");
  }

  // 9. Create Service Booking
  console.log("\n9. Testing Service Booking Creation...");
  const bookingDate = new Date();
  bookingDate.setDate(bookingDate.getDate() + 2);

  const bookingRes = await request('/api/bookings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${userToken}` },
    body: {
      customerName: testUser.name,
      customerPhone: testUser.phone,
      serviceType: 'House Wiring',
      bookingDate: bookingDate.toISOString().split('T')[0],
      description: 'Need electrical wiring for new hall and MCB box installation in Muddanur.'
    }
  });
  assert(bookingRes.status === 201 && bookingRes.data.bookingCode, `Booking created with code: ${bookingRes.data.bookingCode}`);
  const createdBooking = bookingRes.data;

  // 10. Track Booking by Code
  console.log("\n10. Testing Booking Status Tracking...");
  const trackRes = await request(`/api/bookings/track/${createdBooking.bookingCode}`);
  assert(trackRes.status === 200 && trackRes.data.status === 'Pending', `Booking tracked by reference code: Status is ${trackRes.data.status}`);

  // 11. Customer My Bookings List
  console.log("\n11. Testing Customer My Bookings Endpoint...");
  const myBookingsRes = await request('/api/bookings/mybookings', {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  const hasBooking = myBookingsRes.data.some(b => b.bookingCode === createdBooking.bookingCode);
  assert(myBookingsRes.status === 200 && hasBooking, `Customer dashboard displays newly booked service request`);

  // 12. Submit Contact Inbox Message
  console.log("\n12. Testing Contact Message Submission...");
  const messageRes = await request('/api/messages', {
    method: 'POST',
    body: {
      name: testUser.name,
      email: testUser.email,
      phone: testUser.phone,
      subject: 'Inquiry about Industrial 3-Phase Wiring',
      message: 'Hello, what are the visiting charges for factory panel inspection?'
    }
  });
  assert(messageRes.status === 201, `Customer contact message submitted successfully`);
  const createdMessage = messageRes.data;

  // 13. Submit Customer Review
  console.log("\n13. Testing Customer Review Submission...");
  const reviewRes = await request('/api/reviews', {
    method: 'POST',
    body: {
      customerName: testUser.name,
      rating: 5,
      comment: 'Excellent electrical and wiring services by Vinay! Clean and professional workmanship.'
    }
  });
  assert(reviewRes.status === 201, `Customer review submitted (enters moderation queue)`);
  const createdReview = reviewRes.data.review;

  console.log("\n---------------------------------------------------------------");
  console.log("PART 2: ADMIN PORTAL WORKFLOW TEST");
  console.log("---------------------------------------------------------------");

  // 14. Admin Authentication
  console.log("14. Testing Admin Login...");
  const adminRes = await request('/api/auth/admin/login', {
    method: 'POST',
    body: {
      username: 'admin',
      password: 'Vinay@8498870697'
    }
  });
  assert(adminRes.status === 200 && adminRes.data.token, `Admin authenticated successfully`);
  const adminToken = adminRes.data.token;

  // 15. Admin Profile Fetch
  console.log("\n15. Testing Admin Profile...");
  const adminProfileRes = await request('/api/auth/admin/profile', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(adminProfileRes.status === 200 && adminProfileRes.data.username === 'admin', `Admin profile verified`);

  // 16. Admin Fetch All Bookings
  console.log("\n16. Testing Admin Fetch All Bookings...");
  const allBookingsRes = await request('/api/bookings', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const foundAdminBooking = allBookingsRes.data.find(b => b.bookingCode === createdBooking.bookingCode);
  assert(allBookingsRes.status === 200 && foundAdminBooking, `Admin retrieved all bookings (${allBookingsRes.data.length} total)`);

  // 17. Admin Update Booking Status & Notes
  console.log("\n17. Testing Admin Update Booking Status (Pending -> In Progress)...");
  const updateBookingRes = await request(`/api/bookings/${createdBooking._id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: {
      status: 'In Progress',
      adminNotes: 'Technician Vinay assigned. Materials dispatched.'
    }
  });
  assert(updateBookingRes.status === 200, `Booking status updated to 'In Progress' with Handyman notes`);

  // 18. Verify Customer Sees Status & Notes in Tracker
  console.log("\n18. Testing Customer Tracking after Admin Update...");
  const trackUpdatedRes = await request(`/api/bookings/track/${createdBooking.bookingCode}`);
  assert(
    trackUpdatedRes.data.status === 'In Progress' && 
    trackUpdatedRes.data.adminNotes.includes('Vinay assigned'),
    `Customer tracker verified: Status is 'In Progress' with Admin Notes displayed!`
  );

  // 19. Admin Fetch and Resolve Contact Message
  console.log("\n19. Testing Admin Message Resolution...");
  const messagesRes = await request('/api/messages', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(messagesRes.status === 200 && messagesRes.data.length > 0, `Admin fetched contact messages inbox`);

  if (createdMessage && createdMessage._id) {
    const resolveRes = await request(`/api/messages/${createdMessage._id}/resolve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(resolveRes.status === 200, `Message marked as resolved by Admin`);
  }

  // 20. Admin Review Approval
  console.log("\n20. Testing Admin Review Moderation & Approval...");
  const pendingReviewsRes = await request('/api/reviews/pending', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(pendingReviewsRes.status === 200, `Admin fetched pending reviews for moderation`);

  if (createdReview && createdReview._id) {
    const approveRes = await request(`/api/reviews/${createdReview._id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(approveRes.status === 200, `Review approved by Admin`);

    // Verify it appears in public approved reviews
    const publicReviews = await request('/api/reviews');
    const isApprovedVisible = publicReviews.data.some(r => r._id === createdReview._id || r.customerName === testUser.name);
    assert(publicReviews.status === 200 && isApprovedVisible, `Approved review is now live on public homepage!`);
  }

  console.log("\n===============================================================");
  console.log(`🏁 TEST EXECUTION FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");
}

run();
