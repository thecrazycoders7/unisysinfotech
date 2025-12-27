# 📖 QUICK REFERENCE GUIDE

## Common Commands

### Backend
```bash
# Start development
cd backend && npm run dev

# Run tests
npm test

# Seed database with sample data
npm run seed

# Build for production
npm run build
```

### Frontend
```bash
# Start development
cd frontend && npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check code quality
npm run lint
```

---

## File Locations

### Backend Key Files
```
backend/src/
├── index.js                  # Server entry point
├── models/User.js            # User authentication model
├── models/Client.js          # Client data model
├── models/HoursLog.js        # Hours tracking model
├── routes/authRoutes.js      # Auth endpoints
├── routes/clientRoutes.js    # Client CRUD endpoints
├── routes/hoursRoutes.js     # Hours logging endpoints
├── routes/reportsRoutes.js   # Analytics endpoints
├── middleware/auth.js        # JWT verification
└── config/database.js        # MongoDB connection
```

### Frontend Key Files
```
frontend/src/
├── App.jsx                   # Route configuration
├── components/Navbar.jsx     # Navigation bar
├── pages/HomePage.jsx        # Home page
├── pages/admin/AdminDashboard.jsx
├── pages/user/UserDashboard.jsx
├── api/endpoints.js          # API call functions
├── store/index.js            # Zustand state stores
└── index.css                 # Global styles
```

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=supersecretkey
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=refreshsecret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
```

---

## API Quick Reference

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@unisysinfotech.com",
    "password": "AdminPassword123!"
  }'
```

### Create Client
```bash
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Tech Corp",
    "email": "contact@techcorp.com",
    "industry": "Technology",
    "contactPerson": "John Doe"
  }'
```

### Log Hours
```bash
curl -X POST http://localhost:5000/api/hours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "date": "2024-12-22",
    "hoursWorked": 8,
    "category": "Development",
    "taskDescription": "Feature development"
  }'
```

---

## Database Queries (MongoDB)

### Find all clients
```javascript
db.clients.find().pretty()
```

### Get user's hours for a date range
```javascript
db.hourslogs.find({
  userId: ObjectId("..."),
  date: { $gte: ISODate("2024-12-01"), $lte: ISODate("2024-12-31") }
})
```

### Delete old logs
```javascript
db.hourslogs.deleteMany({
  date: { $lt: ISODate("2024-01-01") }
})
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| MongoDB connection error | Check IP whitelist in Atlas & connection string |
| CORS error | Verify FRONTEND_URL in backend .env |
| npm install fails | Clear cache: `npm cache clean --force` |
| Page not loading | Check browser console for errors |
| API not responding | Check backend server is running on 5000 |

---

## File Naming Conventions

- **Components:** PascalCase (UserDashboard.jsx)
- **Functions:** camelCase (fetchUsers)
- **Constants:** UPPER_SNAKE_CASE (API_BASE_URL)
- **CSS Classes:** kebab-case (.button-primary)
- **Files:** PascalCase for components, camelCase for utilities

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/client-management

# Make changes and commit
git add .
git commit -m "Add client management feature"

# Push to GitHub
git push origin feature/client-management

# Create Pull Request on GitHub
# After review, merge to main

# Pull latest on main
git checkout main
git pull origin main
```

---

## Performance Checklist

Frontend:
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading enabled
- [ ] Bundle size < 500KB

Backend:
- [ ] Queries indexed
- [ ] Pagination implemented
- [ ] Compression enabled
- [ ] Cache headers set

---

## Security Checklist

- [ ] No passwords in .env files (use .env.local)
- [ ] No API keys in code
- [ ] Validate all user inputs
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated
- [ ] Regular security audits

---

## Useful npm Packages (Optional)

```bash
# Add to backend for production
npm install express-rate-limit helmet mongoose-sanitize

# Add to frontend for advanced features
npm install framer-motion recharts react-select
```

---

## Deployment URLs (After Setup)

```
Frontend: https://unisysinfotech.com
Backend API: https://api.unisysinfotech.com
Admin Panel: https://unisysinfotech.com/admin
User Portal: https://unisysinfotech.com/user
```

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@unisysinfotech.com | AdminPassword123! |
| User | john.dev@unisysinfotech.com | UserPassword123! |
| User | sarah.qa@unisysinfotech.com | UserPassword123! |
| User | mike.devops@unisysinfotech.com | UserPassword123! |

---

## Important Dates & Deadlines

- **Project Start:** December 22, 2024
- **Phase 1 Complete:** December 22, 2024 ✅
- **Go-Live Ready:** December 22, 2024 ✅
- **Target Launch:** January 15, 2025

---

## Contact & Support

- **Issues:** GitHub Issues
- **Email:** info@unisysinfotech.com
- **Documentation:** See README.md, SETUP.md, DEPLOYMENT.md

---

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)

---

**Last Updated:** December 22, 2024 | Version 1.0.0
