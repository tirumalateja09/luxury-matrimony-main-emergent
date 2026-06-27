# RVR Luxury Matrimony - Admin Dashboard PRD

## Original Problem Statement
Implement a professional Admin Dashboard with modern UI for a matrimonial platform. Dashboard cards for Total Users, Active Users, Premium Members (Gold/Silver/Basic/Boosts), Male vs Female Ratio, Today's Registrations, Successful Matches module, Revenue Analytics, Pending Verification, Reported Profiles with charts, real-time stats, export, search, filters, pagination.

## Architecture
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Recharts
- **Backend:** Python FastAPI (port 8001) with Motor (async MongoDB driver)
- **Database:** MongoDB (matrimonial database)
- **Auth:** JWT-based admin authentication with bcrypt password hashing

## User Personas
- **Super Admin:** Full access to dashboard, user management, match management, verification, reports

## Core Requirements (Static)
1. Admin authentication (login/register/token-status)
2. Dashboard with real-time statistics
3. User management (list, search, filter, paginate, verify)
4. Successful matches CRUD
5. Revenue analytics with charts
6. Pending verification queue
7. Reported profiles management
8. Export (CSV, Excel, PDF)

## What's Been Implemented (June 2026)

### Backend (/app/backend/server.py)
- FastAPI server with admin auth (login, register, token-status)
- Enhanced stats API with all metrics (total users, active, premium breakdown, gender ratio, today's registrations, matches, revenue breakdown, pending verification, reported)
- Users CRUD with search, filters, pagination
- Successful Matches CRUD
- Pending Verification queue
- Reported Profiles management
- Subscribers list API
- Revenue analytics with monthly trends
- Export API (CSV, Excel, PDF)
- Admin seeding on startup

### Frontend (/app/frontend/src/app/admin/)
- **page.jsx** - Main dashboard with navigation, user table, search, filters
- **component/Admin/DashboardStats.jsx** - 5 stat cards, 3 action cards, premium members breakdown, gender ratio pie chart, membership distribution pie, revenue cards, bar chart, area chart, export buttons
- **matches/page.jsx** - Matches CRUD with add/edit modal, search, pagination
- **pending-verification/page.jsx** - Verification queue with approve/reject actions
- **reported-profiles/page.jsx** - Reports with status management
- **subscribers/page.jsx** - Subscriber list filtered by plan/boost type

## Prioritized Backlog
### P0 (Done)
- [x] Admin dashboard with all stat cards
- [x] Premium members breakdown
- [x] Gender ratio chart
- [x] Revenue analytics with charts
- [x] Successful matches module
- [x] Pending verification
- [x] Reported profiles
- [x] Export functionality
- [x] Search, filters, pagination

### P1 (Next)
- [ ] User profile detail view from admin
- [ ] Bulk actions (approve multiple profiles, suspend multiple users)
- [ ] Dashboard date range filters
- [ ] Real-time WebSocket updates

### P2 (Future)
- [ ] Admin role management (super admin, moderator)
- [ ] Audit logs for admin actions
- [ ] Email notifications to users on status changes
- [ ] Advanced revenue forecasting
- [ ] User activity heat maps
