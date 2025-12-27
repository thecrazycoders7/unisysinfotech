# UNISYS INFOTECH - Project Setup Guide

This guide will help you set up and run the complete UNISYS INFOTECH full-stack application.

## 🎯 Quick Start (5 minutes)

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- **MongoDB Account** ([Free Atlas Cluster](https://www.mongodb.com/cloud/atlas))
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/unisys-infotech.git
cd unisys-infotech
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your MongoDB URI:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/unisys_infotech
```

Start backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Step 3: Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### Step 4: Test the App
- Open http://localhost:5173
- Click "Sign Up" to create an account
- Or login with test account

✅ **You're ready!**

---

## 📋 Project Structure

```
unisys-infotech/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, errors
│   │   ├── config/          # Database config
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route pages
│   │   ├── components/      # Reusable UI
│   │   ├── api/             # API calls
│   │   ├── store/           # State management
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── README.md
├── DEPLOYMENT.md
└── SETUP.md (this file)
```

---

## 🔑 Test Credentials

After seeding database:

**Admin Account:**
```
Email: admin@unisysinfotech.com
Password: AdminPassword123!
```

**User Account:**
```
Email: john.dev@unisysinfotech.com
Password: UserPassword123!
```

---

## 📚 Available Scripts

### Backend
```bash
npm run dev       # Start with hot reload (nodemon)
npm test         # Run tests
npm run seed     # Populate sample data
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
```

---

## 🌐 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Admin - Clients (Protected)
- `GET /api/clients` - List all clients
- `POST /api/clients` - Add new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### User - Hours (Protected)
- `GET /api/hours` - Get your hours logs
- `POST /api/hours` - Log new hours
- `PUT /api/hours/:id` - Update hours entry
- `DELETE /api/hours/:id` - Delete entry

### Reports
- `GET /api/reports/hours-summary` - Monthly hours (admin)
- `GET /api/reports/client-activity` - Client stats (admin)
- `GET /api/reports/my-weekly-summary` - Your week
- `GET /api/reports/my-monthly-summary` - Your month

---

## 🔐 Authentication Flow

1. **Register/Login** → Get JWT token
2. **Store token** in localStorage
3. **Attach token** to API requests (`Authorization: Bearer {token}`)
4. **Token expires** after 24 hours
5. **Auto logout** if token invalid

---

## 🎨 Features Overview

### Public Website
- ✅ Home page with hero section
- ✅ About Us page
- ✅ Services showcase
- ✅ Contact form
- ✅ Careers page with job listings
- ✅ Dark mode toggle
- ✅ Mobile responsive

### Admin Portal
- ✅ Dashboard with statistics
- ✅ Client management (CRUD)
- ✅ Search & filter clients
- ✅ Hours tracking reports
- ✅ Employee activity feed
- ✅ Export reports (ready to implement)

### User Portal
- ✅ Personal dashboard
- ✅ Log daily working hours
- ✅ Hours calendar view
- ✅ Work history tracking
- ✅ Monthly/weekly summaries
- ✅ Task descriptions support

---

## 🚀 Environment Variables

### Backend `.env`
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database_name
JWT_SECRET=your_secret_key_min_32_chars_long
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=your_refresh_secret_key
REFRESH_TOKEN_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env.local`
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Troubleshooting

### Cannot connect to MongoDB
```
✗ Error: MongoNetworkError
✓ Solution: 
  1. Check connection string in .env
  2. Whitelist your IP in MongoDB Atlas
  3. Verify username/password
```

### Port 5000 already in use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### CORS errors in browser console
```
✗ Error: Access blocked by CORS policy
✓ Solution:
  1. Ensure FRONTEND_URL in backend .env matches your frontend URL
  2. Check API URL in frontend
  3. Restart both servers
```

### npm install fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🔒 Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT authentication with expiration
- ✅ Input validation on all forms
- ✅ CORS properly configured
- ✅ Environment variables for secrets
- ✅ XSS protection via React
- ✅ HTTPS ready for production

### For Production Add:
- [ ] Rate limiting (express-rate-limit)
- [ ] CSRF protection
- [ ] Security headers (helmet.js)
- [ ] SQL/NoSQL injection protection
- [ ] Regular security audits
- [ ] Backup strategy

---

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'user',
  designation: String,
  department: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Clients Collection
```javascript
{
  name: String,
  email: String (unique),
  industry: String,
  contactPerson: String,
  phone: String,
  address: String,
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

### HoursLog Collection
```javascript
{
  userId: ObjectId,
  clientId: ObjectId,
  date: Date,
  hoursWorked: Number (0-24),
  taskDescription: String,
  category: 'Development' | 'Testing' | 'Meeting' | 'Documentation' | 'Support' | 'Other',
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📈 Performance Tips

### Frontend
- Using Vite for fast HMR
- React code splitting with React Router
- Tailwind CSS for optimized styles
- Zustand for minimal state management

### Backend
- MongoDB indexing on frequently queried fields
- Pagination for large lists
- Request validation before DB queries
- GZIP compression ready

---

## 🚢 Deployment Ready

The project is production-ready! See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- ✅ Vercel frontend deployment
- ✅ Railway/Render backend deployment
- ✅ MongoDB Atlas configuration
- ✅ Custom domain setup
- ✅ SSL/HTTPS setup
- ✅ Continuous deployment

---

## 📞 Support

- **Documentation:** See README.md and DEPLOYMENT.md
- **Issues:** GitHub Issues
- **Email:** info@unisysinfotech.com

---

## 📄 License

MIT License - See LICENSE file

---

## 🎓 Learning Resources

### Recommended Reading
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [JWT Authentication](https://jwt.io/introduction)

---

## ✅ Completion Checklist

- [ ] Clone repository
- [ ] Install backend dependencies
- [ ] Set MongoDB URI in .env
- [ ] Start backend server
- [ ] Install frontend dependencies
- [ ] Start frontend server
- [ ] Create account and login
- [ ] Test admin panel
- [ ] Test user portal
- [ ] Review API endpoints
- [ ] Read DEPLOYMENT.md for production

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
