# RVR Luxury Matrimony

A full-stack matrimonial platform with Next.js frontend and Node.js + Express backend.

## Project Structure

```
root/
├── frontend/          # Next.js application (React 19, Tailwind CSS 4)
├── backend/           # Node.js + Express API server
└── README.md
```

## Prerequisites

- Node.js >= 18.x
- MongoDB (local or Atlas)
- npm or yarn

---

## Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env .env.local
# Edit .env with your MongoDB URI, JWT secret, Cloudinary, Razorpay, etc.

# Start development server
npm run dev

# Start production server
npm start
```

Backend runs on **http://localhost:5000**

### Admin Credentials (auto-seeded on first run)
- **Email:** admin@rvrluxury.com  
- **Password:** Admin@123456

---

## Frontend Setup

```bash
cd frontend
npm install

# Set environment variable
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000/api' > .env.local

# Start development server
npm run dev
```

Frontend runs on **http://localhost:3000**

---

## API Routes

### Admin API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/login | Admin login |
| POST | /api/admin/register | Admin register |
| GET | /api/admin/token-status | Check token validity |
| GET | /api/admin/stats | Dashboard statistics |
| GET | /api/admin/revenue | Revenue analytics |
| GET | /api/admin/export/users | Export users (csv/xlsx) |
| GET | /api/admin/users | List all users |
| GET | /api/admin/user-details/:id | User details by ID |
| GET | /api/admin/user-details/profile/:id | User details by profile ID |
| PUT | /api/admin/users/:id/account-status | Update account status |
| POST | /api/admin/users/manual | Create user manually |
| POST | /api/admin/users/bulk-upload | Bulk create users |
| GET | /api/admin/pending-verification | Pending profile verifications |
| PUT | /api/admin/verify-profile/:id | Approve/reject profile |
| GET | /api/admin/matches | List successful matches |
| POST | /api/admin/matches | Create match |
| PUT | /api/admin/matches/:id | Update match |
| DELETE | /api/admin/matches/:id | Delete match |
| GET | /api/admin/reported-profiles | List reported profiles |
| POST | /api/admin/reported-profiles | Create report |
| PUT | /api/admin/reported-profiles/:id | Update report status |
| GET | /api/admin/subscribers | List subscribers |
| GET | /api/admin/contact-us | Contact us submissions |
| GET | /api/admin/notifications | Admin notifications |

### Auth API
- POST /api/auth/send-otp
- POST /api/auth/verify-otp
- POST /api/auth/login

### User API  
- GET/PUT /api/user/profile
- GET /api/search

---

## Migration Summary

This project was migrated from a **Python FastAPI** admin backend to **Node.js + Express**.

**Changes made:**
- Replaced `backend/server.py` (Python FastAPI) with full Node.js Express application
- Added missing admin routes to Node.js: matches CRUD, pending-verification, reported-profiles, subscribers, revenue analytics, export
- Created new models: `SuccessfulMatch`, `ReportedProfile`
- Enhanced `getAdminStats` to return complete dashboard data
- Added admin auto-seeding on server startup
- Frontend `.env.local` configured to point to Node.js backend
