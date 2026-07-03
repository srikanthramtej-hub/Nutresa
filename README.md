# 🌿 NutriNest — Full Stack Dry Fruits E-commerce

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: NestJS
- **Database**: Prisma + SQLite
- **Auth**: JWT + Google OAuth
- **File Upload**: Multer (product images stored in /backend/uploads/products/)

## Quick Start

### 1. Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run start:dev
# Running on http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

## Admin Login
- Email: `admin@nutrinest.in`
- Password: `admin123`

## Admin Features
- ➕ Add new products with image upload
- ✏️ Edit existing products (name, price, description, image, weight options)
- 🖼️ Upload product images — shown live on the store
- 📦 Manage stock — set to 0 = Out of Stock on frontend
- 📋 Accept & advance order status
- ⬇️ Download shipping labels
- 👥 View customers, export CSV

## API Endpoints
| Route | Method | Description |
|-------|--------|-------------|
| /api/auth/register | POST | Register |
| /api/auth/login | POST | Login |
| /api/auth/google | GET | Google OAuth |
| /api/products | GET | All products |
| /api/products/:id | GET | Single product |
| /api/products/:id/reviews | POST | Add review (auth) |
| /api/cart | GET/POST/PUT/DELETE | Cart (auth) |
| /api/orders | POST | Place order (auth) |
| /api/orders/my | GET | My orders (auth) |
| /api/admin/dashboard | GET | Stats (admin) |
| /api/admin/orders | GET | All orders (admin) |
| /api/admin/orders/:id/status | PATCH | Update status (admin) |
| /api/admin/products | GET/POST | Products (admin) |
| /api/admin/products/:id | PUT/DELETE | Edit/Delete (admin) |
| /api/admin/products/:id/stock | PATCH | Update stock (admin) |
| /api/admin/customers | GET | Customers (admin) |
| /api/admin/customers/export | GET | CSV export (admin) |
