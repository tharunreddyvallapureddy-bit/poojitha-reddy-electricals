# Poojitha Reddy Electricals - Web Application

A modern, fullstack web application built for **Poojitha Reddy Electricals**, a premier handyman and electrical contracting business managed by **V. Vinay Kumar Reddy** in Muddanur, YSR Kadapa, Andhra Pradesh.

---

## 🌐 Live Application Links

- **Primary Website:** [https://poojithareddyelectricals.dpdns.org/](https://poojithareddyelectricals.dpdns.org/)
- **GitHub Pages Mirror:** [https://tharunreddyvallapureddy-bit.github.io/poojitha-reddy-electricals/](https://tharunreddyvallapureddy-bit.github.io/poojitha-reddy-electricals/)
- **Admin Portal:** [https://poojithareddyelectricals.dpdns.org/#/admin-login](https://poojithareddyelectricals.dpdns.org/#/admin-login)

---

## 📖 About the Website

The **Poojitha Reddy Electricals** platform serves as the digital front office and operations management portal for residential, commercial, and industrial electrical and handyman services. Designed with a high-end glassmorphic dark theme, the website provides a seamless experience for customers to browse services, submit appointment requests, track status in real-time, read verified customer feedback, and directly reach the technician.

### Services Offered
- **All Electrical Works:** Home troubleshooting, short circuits, switchboard repair, appliance fitting, fan and lighting setup.
- **Industrial Works:** Factory control panels, industrial motor wiring, three-phase power routing, generator hookups.
- **Plumbing Works:** Pipeline leakage repairs, water pump installation and servicing, drainage solutions, sanitary fittings.
- **Welding Works:** Metal gate fabrication, safety grill welding, balcony railings, sheet metal repairs.
- **House Wiring:** Complete new building wiring, distribution board (DB/MCB) installations, earthing, inverter and UPS routing.

---

## 💻 Technologies Used

### Frontend Architecture
- **React 18:** Modern functional component architecture with React Hooks.
- **Vite:** High-performance build tool and dev server with optimized code-splitting and asset bundling.
- **React Router DOM (HashRouter):** Client-side routing with hash navigation to guarantee seamless compatibility across multiple domains, custom DNS records, and static GitHub Pages sub-paths without white-screen or 404 routing errors.
- **Custom CSS3 Glassmorphic Design:** Handcrafted neon-accented dark UI with glassmorphism, responsive CSS Grid and Flexbox layouts, glow effects, and smooth CSS transitions.
- **Responsive Mobile-First Interface:** Optimized for desktops, tablets, and smartphones with mobile drawer navigation.

### Backend & API
- **Node.js:** Server-side JavaScript runtime environment.
- **Express.js:** Lightweight and fast REST API framework structuring endpoints for authentication, bookings, tracking, messages, and reviews.
- **JSON Web Tokens (JWT):** Secure token-based session management for customer accounts and administrator access.
- **Bcrypt.js:** Cryptographic hashing for secure user and administrator password storage.
- **CORS & Environment Configurations:** Configured with Cross-Origin Resource Sharing and environment variable injection for production deployments.

### Database & Cloud Storage
- **Firebase Firestore:** Cloud database integration for real-time document synchronization across customer bookings, inbox messages, reviews, and administrator datasets.
- **MongoDB / Mongoose:** Object Data Modeling (ODM) layer for schema validation, querying, and persistent record storage.
- **Automated Local-First Failover Engine:** Robust fallback architecture that enables full local offline functionality using structured JSON storage whenever cloud or external databases are unreachable.

### Hosting & CI/CD
- **GitHub Pages:** Static frontend hosting with custom CNAME domain mapping and HTTPS automation.
- **Custom Domain DNS:** Multi-record DNS configuration mapping `poojithareddyelectricals.dpdns.org` directly to GitHub Pages edge servers.
- **Render Cloud:** Cloud hosting for the Node.js Express REST API backend service.
- **GitHub Actions:** Automated continuous integration and continuous deployment (CI/CD) pipelines for frontend builds.

---

## 🛠️ Key Features

1. **Interactive Hero & Showcase:** Introduces the brand, business owner V. Vinay Kumar Reddy, contact numbers, and 24/7 emergency response indicators.
2. **Comprehensive Services Catalog:** Interactive service cards with detailed descriptions, task bullet points, and direct booking links.
3. **Protected Online Booking System:** Requires customer sign-in or registration to book an appointment, pre-filling customer details and preventing spam requests.
4. **Real-Time Booking Tracker:** Customers can monitor their request status (`Pending`, `Accepted`, `In Progress`, `Completed`, or `Cancelled`) and view handyman updates using their reference code (e.g., `PRE-W19A82`).
5. **Customer Authentication & Dashboard:** Complete customer registration, secure login, and a dedicated portal where clients can view their personal booking history.
6. **Customer Reviews & Moderation:** Real customer testimonials with 5-star ratings, complete with an administrative moderation queue for approval before public display.
7. **Direct Contact System:** Integrated contact form with instant notifications and direct phone hotlines.
8. **Administrative Command Center:** Protected administrative dashboard to manage appointment requests, update technician notes, approve reviews, and resolve customer messages.

---

## 🚀 Running Locally

### 1. Clone the Repository
```bash
git clone https://github.com/tharunreddyvallapureddy-bit/poojitha-reddy-electricals.git
cd poojitha-reddy-electricals
```

### 2. Start the Backend API
```bash
cd backend
npm install
npm start
```
*The backend server runs on `http://localhost:5000`.*

### 3. Start the Frontend Application
```bash
cd ../frontend
npm install
npm run dev
```
*The frontend development server runs on `http://localhost:5173`.*

---

## 📞 Business Contact

- **Business Name:** Poojitha Reddy Electricals
- **Proprietor:** V. Vinay Kumar Reddy
- **Phone:** +91 84988 70697
- **Location:** 2-61, Nallaballe, Muddanur, YSR Kadapa District, Andhra Pradesh, India
