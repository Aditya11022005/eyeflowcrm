# Eyelitz CRM

A modern, multi-tenant SaaS CRM platform for Eye Clinics, Optical Stores, and Eye Checkup Centers. Built using the MERN Stack (MongoDB, Express.js, React.js, Node.js) with Tailwind CSS, Redux Toolkit, and Recharts.

---

## Key Features

1. **Multi-Tenant SaaS Isolation:** Store/clinic specific data isolation at database query levels.
2. **Vision Examination Rx:** Record sphere, cylinder, axis, ADD, PD, and visual acuity values. Auto-advice summaries.
3. **Printable Prescriptions:** Direct visual layout rendering with standard browser printable sheets compatibility (hides system menus).
4. **SaaS Billing Subscriptions:** Automated expiration timers, warning banners, and built-in **Razorpay sandbox checkout simulation** triggers.
5. **Command Admin Dashboard:** Platform metrics dashboard to register, update, and manage multiple optometry centers.
6. **Stock Management Warnings:** SKU and barcode support with automatic notifications when stock levels dip.

---

## Project Structure

```
.
├── backend/                  # Express API Server
│   ├── config/               # DB connections
│   ├── controllers/          # MERN request logic handlers
│   ├── middleware/           # Security, auth, and sub validators
│   ├── models/               # Mongoose DB Schemas
│   ├── routes/               # API Router bindings
│   └── server.js             # Main entrypoint
│
└── frontend/                 # Vite React Client
    ├── src/
    │   ├── components/       # Sidebars and nav headers
    │   ├── layouts/          # Route guards wrapper frames
    │   ├── pages/            # Core dashboard and clinic pages
    │   ├── store/            # Redux global session states
    │   └── utils/            # Axios API config
    ├── tailwind.config.js    # Tailwind styling tokens
    └── vite.config.js        # Vite config
```

---

## Seeded Manual Credentials

### 1. Platform Super Admin
Use this to log in to the SaaS Command Panel to audit clinics and check subscriptions:
- **Email:** `admin@eyelitz.com`
- **Password:** `adminpassword123`

### 2. Clinic Stores
You can sign up a custom clinic store using the **Signup Page** onboarding flow. This creates:
- The clinic Store tenant.
- An Owner User account.
- Sets a 30-day Free Trial.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed locally.
- A running [MongoDB](https://www.mongodb.com/) instance (either local on port 27017 or a MongoDB Atlas URI configured in `backend/.env`).

### Setup & Run

1. **Start the Backend API Server:**
   ```bash
   cd backend
   npm run dev
   ```
   *Server boots on: `http://localhost:5000`*

2. **Start the Frontend Client:**
   ```bash
   cd ../frontend
   npm run dev
   ```
   *App boots on: `http://localhost:5173`*
"# EyelitzCRM-" 
