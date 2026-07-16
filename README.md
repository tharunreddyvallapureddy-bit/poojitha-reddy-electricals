# Poojitha Reddy Electricals - MERN Fullstack Application

A premium MERN fullstack application built for **Poojitha Reddy Electricals** (Handyman Services managed by V. Vinay Kumar Reddy). Featuring high-class glassmorphic dark UI, automated local-first JSON database failover, customer portal (Sign In/Up), booking requests, status tracking, review submission, contact systems, and a complete admin panel.

---

## 🚀 How to Run the Application

The project is structured into two parts: `/backend` and `/frontend`.

### Step 1: Start the Backend Server
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Start the Node.js Express server:
   ```bash
   npm start
   ```
   *Note: The server runs on **port 5000**. If MongoDB is running on your machine, it will connect to it automatically. If MongoDB is offline, it will automatically fall back to using `database_fallback.json` (zero configuration needed!).*

### Step 2: Start the Frontend Client
1. Open another terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the provided link (usually `http://localhost:5173`).

---

## 🔑 Admin Credentials
To access the admin dashboard (e.g. modify booking status, approve reviews, resolve inbox messages):
- **URL**: Go to the site, click the lock icon in the top right (or click "Admin Portal" in the footer) to go to `/admin-login`.
- **Username**: `admin`
- **Password**: `Vinay@8498870697`

---

## 🛠️ Key Features Built
1. **Interactive Hero Section:** Showcases V. Vinay Kumar Reddy, handyman certifications, contact numbers, and custom glowing neon hexagon widgets.
2. **Services Grid:** Visual cards for *All Electrical Works, Industrial Works, Plumbing Works, Welding Works,* and *House Wiring* with booking anchors.
3. **Interactive Booking Request Form:** Allows guest checkout or customer-account booking (pre-fills customer info). Checks inputs and blocks past dates.
4. **Reference Code Booking Tracker:** Provides customers with a tracking code to check their request status (Pending, Accepted, In Progress, Completed, Cancelled) and handyman updates in real-time.
5. **Customer Sign In & Sign Up:** Premium animated panel with input validations. Creates customer dashboards displaying their history and profiles.
6. **Moderate Reviews System:** Customers can leave ratings and comments. Submissions enter a moderation state and require admin approval before going live on the homepage.
7. **Contact Inbox:** Customer messages save straight to the database and display in the admin dashboard inbox with toggleable resolved status.
8. **Admin Panel:** Complete tab-controlled command center with live system metrics counters, bookings status adjuster, notes updates, reviews approval lists, and contact messages management.
