# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend-server-app
npm install
```

Create `.env` file:
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

Start MongoDB (if using local):
```bash
mongod
```

Start backend:
```bash
npm start
# or
npm run dev  # with nodemon
```

### 2. Frontend Setup

```bash
cd client-react-app
npm install
```

Create `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

### 3. First Admin User

To create the first admin user, you can either:

**Option A: Use MongoDB Compass (GUI Method)**

1. **Open MongoDB Compass** and connect to your MongoDB instance (usually `mongodb://localhost:27017`)

2. **Create the database:**
   - In the left sidebar, you'll see databases like `admin`, `config`, `local`
   - Click the "+" button or "Create Database" button
   - Database Name: `zakat-platform`
   - Collection Name: `users`
   - Click "Create Database"

3. **Generate password hash first:**
   - You need to generate a bcrypt hash for your password
   - **Easy method:** Run this helper script (from `backend-server-app` directory):
   ```bash
   node scripts/generatePasswordHash.js your-password-here
   ```
   - Replace `your-password-here` with your desired password (or leave it blank to use default: `admin123`)
   - Copy the hash that's printed (it will look like `$2a$12$...`)
   - **Alternative method:** Run this one-liner:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password-here', 12).then(hash => console.log(hash));"
   ```

4. **Insert the admin user:**
   - In MongoDB Compass, click on the `zakat-platform` database
   - Click on the `users` collection
   - Click "ADD DATA" → "Insert Document"
   - Paste this JSON (replace the password hash with the one you generated):
   ```json
   {
     "name": "Admin",
     "email": "admin@example.com",
     "password": "$2a$12$YOUR_HASH_HERE",
     "role": "admin",
     "isVerified": true,
     "isBlocked": false,
     "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
     "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
   }
   ```
   - Click "Insert"

**Alternative: Using MongoDB Shell**
```javascript
// In MongoDB shell
use zakat-platform
db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$12$...", // bcrypt hash of your password (generate using the command above)
  role: "admin",
  isVerified: true,
  isBlocked: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Option B: Temporarily modify register route** to allow admin registration, then change it back.

**Option C: Use a script** (create `backend-server-app/scripts/createAdmin.js`):
```javascript
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
    isVerified: true
  });
  console.log('Admin created:', admin);
}

createAdmin();
```

## Important Notes

1. **Cloudinary Setup**: You need a Cloudinary account for image storage. Sign up at https://cloudinary.com and get your credentials.

2. **MongoDB**: You can use MongoDB Atlas (cloud) or local MongoDB. Update `MONGO_URI` accordingly.

3. **JWT Secret**: Change the JWT_SECRET to a strong random string in production.

4. **CORS**: Make sure `FRONTEND_URL` matches your frontend URL.

5. **File Uploads**: The system supports image and document uploads. Make sure Cloudinary is configured properly.

## Testing the Application

1. **Register as Donor**: Create an account with role "donor"
2. **Register as Donee**: Create an account with role "donee"
3. **Login as Donee**: Submit a case application
4. **Login as Admin**: Review and approve cases
5. **Login as Donor**: Browse cases and make donations

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT_SECRET
3. Configure proper MongoDB connection string
4. Set up Cloudinary production account
5. Use Docker Compose for easy deployment
6. Configure Nginx for frontend (already included in Docker setup)

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify `.env` file exists and has all required variables
- Check port 5000 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Check CORS settings in backend

### File uploads not working
- Verify Cloudinary credentials
- Check file size limits (2MB for images, 5MB for documents)
- Check network connectivity

### Authentication issues
- Clear browser localStorage
- Check JWT_SECRET is set correctly
- Verify token expiration settings

