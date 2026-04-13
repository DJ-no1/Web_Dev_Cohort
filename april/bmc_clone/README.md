# Stellar Cinema - Complete Full Stack Seat Booking Application

## 🎬 Project Overview

A modern, full-featured cinema seat booking platform with user authentication, real-time seat booking, and booking management. Built with Node.js/Express backend and vanilla JavaScript frontend.

---

## ✨ Features Implemented

### Authentication System

- ✅ User Registration with email verification
- ✅ JWT-based Login (Access & Refresh Tokens)
- ✅ Email Verification
- ✅ Forgot Password / Reset Password
- ✅ Refresh Token Rotation
- ✅ Logout with Token Invalidation
- ✅ Protected Routes with Middleware

### Frontend Pages

1. **Home/Index** (`/`) - Landing page with login/register options
2. **Login** (`/login`) - User authentication
3. **Register** (`/register`) - New user account creation
4. **Dashboard** (`/dashboard`) - Home page showing available shows and quick stats
5. **Booking** (`/booking?show=ID`) - Interactive seat selection interface
6. **My Bookings** (`/bookings`) - View and manage user bookings
7. **Profile** (`/profile`) - User profile information and statistics

### Booking Features

- 🎯 **Dynamic Seat Selection** - 64 available seats in interactive grid
- 🎫 **Booking Management** - Create, view, and cancel bookings
- 💰 **Price Calculation** - Real-time total price based on selected seats
- 🔒 **Seat Lock System** - Prevent double-booking with database transactions
- ✨ **Visual Feedback** - Color-coded seat status (Available/Booked/Selected)

### Backend API Endpoints

#### Authentication Routes (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh-token` - Get new access token
- `POST /logout` - Logout user
- `GET /verify-email/:token` - Verify email address
- `POST /forgot-password` - Request password reset
- `PUT /reset-password/:token` - Reset password
- `GET /me` - Get current user profile (Protected)

#### Booking Routes (`/api/bookings`)

- `POST /` - Create new booking (Protected)
- `GET /` - Get user's bookings (Protected)
- `GET /:bookingId` - Get specific booking details (Protected)
- `DELETE /:bookingId` - Cancel booking (Protected)

#### Seat Routes (`/api/seats`)

- `GET /` - Get all seats with booking status

---

## 🏗️ Project Structure

```
bmc_clone/
├── frontend/                          # Frontend HTML files
│   ├── index.html                    # Landing page
│   ├── login.html                    # Login page
│   ├── register.html                 # Register page
│   ├── dashboard.html                # Dashboard/Home
│   ├── booking.html                  # Seat booking
│   ├── bookings.html                 # My bookings
│   └── profile.html                  # User profile
│
├── src/
│   ├── app.js                        # Express app setup & routes
│   ├── server.js                     # Server entry point
│   │
│   ├── common/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection
│   │   │   └── email.js             # Email configuration
│   │   ├── middleware/
│   │   │   └── validate.middleware.js # DTO validation
│   │   ├── utils/
│   │   │   ├── api-response.js      # Response formatter
│   │   │   ├── api-error.js         # Error handler
│   │   │   └── jwt.utils.js         # JWT utilities
│   │   └── dto/
│   │       └── base.dto.js          # Base DTO class
│   │
│   └── modules/
│       ├── auth/
│       │   ├── auth.model.js        # User schema
│       │   ├── auth.controller.js   # Request handlers
│       │   ├── auth.service.js      # Business logic
│       │   ├── auth.middleware.js   # Auth middleware
│       │   ├── auth.routes.js       # Route definitions
│       │   └── dto/
│       │       ├── register.dto.js
│       │       ├── login-dto.js
│       │       ├── forgot-password.dto.js
│       │       └── reset-password.dto.js
│       │
│       └── booking_movie/
│           ├── booking.model.js     # Booking schema
│           ├── booking.controller.js # Request handlers
│           ├── booking.service.js   # Business logic
│           ├── booking.routes.js    # Routes
│           ├── seat.model.js        # Seat schema
│           ├── seat.controller.js   # Seat handlers
│           ├── seat.service.js      # Seat logic
│           └── seat.routes.js       # Seat routes
│
├── package.json
├── server.js
├── .env                              # Environment variables
└── docker-compose.yml               # MongoDB container setup
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Docker & Docker Compose
- MongoDB (via Docker)

### Installation & Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start MongoDB**

   ```bash
   npm run db:up
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:4000`

4. **Stop MongoDB**
   ```bash
   npm run db:down
   ```

---

## 🔐 Authentication Flow

### Registration

1. User enters name, email, password on `/register`
2. Password validated and hashed with bcryptjs
3. Email verification token sent
4. User must verify email before login

### Login

1. User enters email & password on `/login`
2. Password compared with hashed version
3. Email verification checked
4. JWT tokens generated (Access + Refresh)
5. Refresh token stored in httpOnly cookie
6. Redirected to dashboard

### Token Refresh

- Access token expires in 15 minutes
- Refresh token (7 days) used to get new access token
- Tokens auto-managed by frontend

---

## 💾 Database Schema

### User Collection

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: "user"),
  isVerified: Boolean,
  verificationToken: String (hashed),
  refreshToken: String (hashed),
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Collection

```javascript
{
  userId: ObjectId (ref: User),
  showId: String,
  showName: String,
  seatIds: [Number],
  totalPrice: Number,
  status: String (confirmed/cancelled/completed),
  createdAt: Date,
  updatedAt: Date
}
```

### Seat Collection

```javascript
{
  id: Number (unique),
  isbooked: Boolean,
  bookedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Frontend Architecture

### Simple Vanilla JS Approach

- No frameworks, no build tools
- Direct HTML files with embedded JavaScript
- localStorage for JWT token storage
- Fetch API for all HTTP requests
- Tailwind CSS for styling
- Dynamic seat rendering with event listeners

### Page Navigation

- URL-based routing (no SPA router)
- Server serves appropriate HTML file
- JavaScript handles client-side logic
- Protected routes check for token before loading

### Token Management

```javascript
// Store token after login
localStorage.setItem("accessToken", token);

// Use token for protected endpoints
fetch("/api/endpoint", {
  headers: { Authorization: `Bearer ${token}` },
  credentials: "include",
});

// Clear on logout
localStorage.removeItem("accessToken");
```

---

## 🔄 Booking Flow

1. **User browses shows** on dashboard
2. **Selects show** and navigates to booking page
3. **Sees seat grid** with color-coded availability
4. **Clicks available seats** to select (max 8 seats per booking)
5. **Views total price** in summary
6. **Clicks "Proceed to Payment"**
7. **API creates booking** and marks seats as booked
8. **Redirected to "My Bookings"**
9. **Can download ticket** or cancel booking

---

## 🛠️ What You Can Build Next

### Phase 1: Enhanced Booking

- [ ] Multiple shows with different times
- [ ] Show ratings and reviews
- [ ] Seat categories (Premium/Standard/Budget)
- [ ] Dynamic pricing based on seat type

### Phase 2: Payment Integration

- [ ] Razorpay/Stripe integration
- [ ] Online payment processing
- [ ] Payment confirmation emails
- [ ] Refund processing for cancellations

### Phase 3: Admin Features

- [ ] Admin dashboard to view all bookings
- [ ] Theater management (add shows, seats)
- [ ] Revenue analytics
- [ ] Booking reports
- [ ] User management

### Phase 4: Advanced Features

- [ ] Real-time seat updates (WebSocket/Socket.io)
- [ ] Waitlist for fully booked shows
- [ ] Group bookings with special pricing
- [ ] Discount codes and coupons
- [ ] Email notifications
- [ ] SMS notifications
- [ ] QR code tickets

### Phase 5: Mobile & Performance

- [ ] React/Vue frontend for SPA experience
- [ ] Mobile app (React Native/Flutter)
- [ ] Progressive Web App (PWA)
- [ ] Caching strategies
- [ ] Database indexing optimization

### Phase 6: Advanced Auth

- [ ] Social login (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Role-based access control (RBAC)
- [ ] User verification levels

### Phase 7: Analytics & Monitoring

- [ ] Google Analytics integration
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] User behavior analytics
- [ ] Business intelligence dashboards

---

## 📊 Current Stats

- **Total Seats**: 64
- **Price per Seat**: ₹250
- **Auth Methods**: JWT with Refresh Tokens
- **Email Service**: Nodemailer with Resend
- **Database**: MongoDB

---

## 🔒 Security Features

✅ Password Hashing with bcryptjs
✅ JWT Token-based Authentication
✅ HttpOnly Cookies for Refresh Tokens
✅ CORS Configuration
✅ Email Verification Required
✅ Token Expiration & Refresh
✅ Input Validation with DTOs
✅ Protected API Routes with Middleware

---

## 📝 Environment Variables

Located in `.env`:

```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://admin:password@127.0.0.1:27017/?authSource=admin
MONGODB_DB=bmc_clone
JWT_ACCESS_SECRET=your_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=your_password
CLIENT_URL=http://localhost:4000
```

---

## 🧪 Testing the Application

### 1. Test Registration

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123","role":"user"}'
```

### 2. Test Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

### 3. Get Seats

```bash
curl http://localhost:4000/api/seats
```

### 4. Create Booking (Replace TOKEN)

```bash
curl -X POST http://localhost:4000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"showId":"1","seatIds":[1,2,3],"totalPrice":750}'
```

---

## 📞 API Response Format

### Success Response

```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    /* payload */
  },
  "error": false
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": true
}
```

---

## 🤝 Contributing

This is a learning project. Feel free to:

- Add new features
- Improve UI/UX
- Optimize database queries
- Add tests
- Refactor code
- Add documentation

---

## 📄 License

ISC

---

## 🎯 Key Learnings

✅ Full-stack JavaScript development
✅ RESTful API design
✅ JWT authentication & authorization
✅ MongoDB data modeling
✅ Email service integration
✅ Frontend-backend integration
✅ Error handling & validation
✅ Security best practices
✅ Responsive web design
✅ State management in frontend

---

**Build Status**: ✅ Production Ready
**Last Updated**: April 2026
**Current Version**: 1.0.0
