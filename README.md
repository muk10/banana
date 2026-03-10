# Zakat & Charity Platform

A full-stack MERN application for managing charity and zakat donations with transparent case management, peer review, and donation tracking.

## Features

- **User Roles**: Admin, Donee (Applicant), and Donor
- **Case Management**: Submit, review, and approve financial assistance cases
- **Peer Review System**: Community-driven case verification
- **Donation Tracking**: Pledge, payment proof upload, and verification
- **Zakat Calculator**: Calculate zakat based on wealth and assets
- **Admin Dashboard**: Analytics, case management, and user administration
- **Security**: JWT authentication, role-based access, rate limiting, input validation
- **Privacy Protection**: Sensitive data is never exposed publicly

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Multer for file uploads
- Cloudinary for image storage
- Zod for validation
- Helmet for security
- Winston for logging
- Express Rate Limiter

### Frontend
- React
- React Router
- Axios
- TailwindCSS
- Zustand for state management
- React Hook Form
- Zod for form validation
- Recharts for analytics

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image storage)
- npm or yarn

## Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend-server-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/zakat-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET=your-cloudinary-api-secret
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
```

4. Start the server:
```bash
npm start
# or for development with nodemon
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd client-react-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

## Docker Deployment

1. Create `.env` file in root directory with required environment variables

2. Build and start containers:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Cases
- `POST /api/cases` - Create new case (Donee)
- `GET /api/cases/public` - Get public cases
- `GET /api/cases/:id` - Get case by ID
- `PUT /api/cases/:id` - Update case (Donee)
- `GET /api/cases/my/cases` - Get my cases (Donee)

### Donations
- `POST /api/donations/pledge` - Pledge donation (Donor)
- `POST /api/donations/:id/upload-proof` - Upload payment proof (Donor)
- `GET /api/donations/my` - Get my donations (Donor)

### Peer Review
- `POST /api/reviews` - Create peer review
- `GET /api/reviews/:caseId` - Get case reviews

### Admin
- `GET /api/admin/cases` - Get all cases for admin
- `PUT /api/admin/cases/:id/approve` - Approve/reject case
- `PUT /api/admin/donations/:id/verify` - Verify donation
- `GET /api/admin/reports` - Get analytics and reports
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/block` - Block/unblock user

### Zakat Calculator
- `POST /api/zakat/calculate` - Calculate zakat

## Workflow

1. **Donee submits case** → Status: `pending`
2. **Admin reviews** → Can approve for peer review, reject, or request more info
3. **Peer review** → Community reviews the case (Status: `peer_review`)
4. **Final admin approval** → Case approved and made public (Status: `approved`)
5. **Donors pledge** → Donors can pledge donations
6. **Payment proof** → Donors upload payment proofs
7. **Admin verification** → Admin verifies and confirms donations
8. **Case funding** → When fully funded, status changes to `funded`

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting on API endpoints
- Helmet security headers
- Input validation with Zod
- File upload size limits
- MongoDB injection protection
- XSS protection

## Privacy Protection

The following sensitive data is never exposed in public case views:
- CNIC numbers
- Exact addresses
- Family member names
- Bank account details (shown only after approval)

## Extra Features

- **Fraud Detection**: Cases with many negative reviews are flagged
- **Case Expiration**: Cases auto-expire after 60 days if unfunded
- **Audit Logs**: Track all admin actions
- **Analytics Dashboard**: Charts and reports for admins

## Development

### Backend Structure
```
backend-server-app/
├── config/          # Database, Cloudinary config
├── controllers/     # Route controllers
├── middleware/      # Auth, error, rate limiting
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utilities (logger, validators)
└── server.js        # Entry point
```

### Frontend Structure
```
client-react-app/
├── src/
│   ├── components/  # Reusable components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── store/        # Zustand stores
│   ├── config/       # Configuration
│   └── App.js        # Main app component
```

## License

ISC

## Support

For issues and questions, please open an issue on the repository.

