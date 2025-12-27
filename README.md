# UNISYS INFOTECH - Full-Stack Website Rebuild

A modern, full-stack web application for UNISYS INFOTECH featuring a public website, admin portal, and employee time tracking system.

## 📁 Project Structure

```
unisys-infotech/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, error handling
│   │   ├── config/         # Database config
│   │   └── index.js        # Server entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/               # React + Vite
    ├── src/
    │   ├── pages/          # Route pages
    │   ├── components/     # Reusable components
    │   ├── api/            # API calls
    │   ├── store/          # Zustand state
    │   ├── App.jsx         # Main app
    │   └── index.css       # Tailwind styles
    ├── package.json
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- MongoDB Atlas account
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

Server runs on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

App runs on http://localhost:5173

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (users only)
- `POST /api/auth/login` - Login (admin & users)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Clients (Admin only)
- `GET /api/clients` - Get all clients (paginated)
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Hours (Users)
- `GET /api/hours` - Get user's hours logs
- `GET /api/hours/:date` - Get hours for specific date
- `POST /api/hours` - Log hours
- `PUT /api/hours/:id` - Update hours log
- `DELETE /api/hours/:id` - Delete hours log

### Reports
- `GET /api/reports/hours-summary` - Hours summary (admin)
- `GET /api/reports/client-activity` - Client activity (admin)
- `GET /api/reports/my-weekly-summary` - User's weekly summary
- `GET /api/reports/my-monthly-summary` - User's monthly summary

## 🔐 Authentication

Uses JWT tokens with:
- 24-hour expiration
- Bearer token format
- Role-based access control (admin/user)
- Automatic token refresh support (ready to implement)

## 🎨 Design

- **Color Scheme:** Navy Blue (#001f3f), Cyan (#00d4ff), Grays
- **Framework:** Tailwind CSS
- **Dark Mode:** Fully supported
- **Responsive:** Mobile-first design
- **Components:** Modern, minimal UI with smooth transitions

## 📦 Tech Stack

### Backend
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- JWT - Authentication
- bcryptjs - Password hashing
- Express Validator - Input validation

### Frontend
- React 18 - UI framework
- Vite - Build tool
- React Router - Routing
- Zustand - State management
- Axios - HTTP client
- Tailwind CSS - Styling
- React Toastify - Notifications

## 🔄 Development Workflow

### Backend Development
```bash
cd backend
npm run dev        # Start with nodemon
npm test          # Run tests
npm run seed      # Seed database
```

### Frontend Development
```bash
cd frontend
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

## 📋 Next Steps (Phase 2-5)

### Phase 2: Public Website Pages
- About Us page
- Services pages (detailed)
- Expertise showcase
- Careers page with job listings
- Contact form integration

### Phase 3: Admin Portal
- Admin dashboard with statistics
- Client management interface
- Employee management
- Report generation

### Phase 4: User Portal
- Employee dashboard
- Hours tracking calendar
- Report views
- Profile settings

### Phase 5: Testing & Deployment
- Unit tests (Jest)
- E2E tests (Cypress)
- Performance optimization
- Deployment to Vercel & Railway

## 🔒 Security

- Input validation & sanitization
- Password hashing with bcrypt
- JWT-based authentication
- CORS protection
- XSS prevention
- Environment variables for secrets

## 📝 License

MIT

## 📧 Contact

**UNISYS INFOTECH**
- Email: info@unisysinfotech.com
- Address: 20830 Torrence Chapel Rd Ste 203, Cornelius, NC 28031
