# UNISYS INFOTECH - Employee Management System

A comprehensive full-stack web application for UNISYS INFOTECH featuring employee management, time tracking, invoice processing, and payroll deductions management.

## 🌟 Key Features

### 📊 Invoice & Payroll Management
- **Advanced Invoice Processing** with employment type tracking (W2/1099)
- **Smart Payroll Deductions** with mutual exclusivity logic
- **Custom Deduction Fields** (up to 3 configurable deductions)
- **Real-time Net Payable Calculations**
- **End Client Tracking** for better project management
- **Automated Table Refresh** after deduction updates

### ⏰ Time Tracking System
- Employee time card management
- Hours logging and tracking
- Weekly and monthly summaries
- Client-based time allocation

### 👥 User Management
- Role-based access control (Admin/Employer/Employee)
- Secure authentication with JWT
- User profile management

### 📈 Reporting & Analytics
- Hours summary reports
- Client activity tracking
- Pending invoice tracker
- Monthly payroll reports

## 📁 Project Structure

```
unisys-infotech/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   │   ├── Invoice.js          # Invoice model with employment type
│   │   │   ├── PayrollDeduction.js # Deductions with custom fields
│   │   │   ├── User.js             # User authentication
│   │   │   └── TimeCard.js         # Time tracking
│   │   ├── routes/         # API endpoints
│   │   │   ├── invoiceRoutes.js    # Invoice CRUD + deductions
│   │   │   ├── authRoutes.js       # Authentication
│   │   │   └── timeCardRoutes.js   # Time tracking
│   │   ├── middleware/     # Auth, error handling
│   │   ├── config/         # Database config
│   │   └── index.js        # Server entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/               # React + Vite
    ├── src/
    │   ├── pages/          # Route pages
    │   │   ├── admin/              # Admin portal
    │   │   │   ├── InvoicesPayroll.jsx  # Invoice management
    │   │   │   ├── AdminDashboard.jsx   # Admin overview
    │   │   │   └── AdminReports.jsx     # Reports
    │   │   ├── employer/           # Employer portal
    │   │   └── employee/           # Employee portal
    │   ├── components/     # Reusable components
    │   ├── api/            # API endpoints
    │   ├── store/          # Zustand state
    │   ├── App.jsx         # Main app
    │   └── index.css       # Tailwind styles
    ├── package.json
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- MongoDB Atlas account or local MongoDB
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
   # Edit .env with your configuration:
   # - MONGODB_URI: Your MongoDB connection string
   # - JWT_SECRET: Secret key for JWT tokens
   # - PORT: Backend port (default: 5001)
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

Server runs on **http://localhost:5001**

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint:**
   ```bash
   # Update src/api/endpoints.js if needed
   # Default: http://localhost:5001/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

App runs on **http://localhost:5173**

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (admin & users)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Invoices
- `GET /api/invoices` - Get all invoices (with filters)
- `GET /api/invoices/:id` - Get single invoice with deductions
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PUT /api/invoices/:id/deductions` - Update payroll deductions
- `GET /api/invoices/pending` - Get pending invoices grouped by person

### Time Cards
- `GET /api/timecards` - Get time cards
- `POST /api/timecards` - Create time card
- `PUT /api/timecards/:id` - Update time card
- `DELETE /api/timecards/:id` - Delete time card

### Reports
- `GET /api/reports/hours-summary` - Hours summary (admin)
- `GET /api/reports/client-activity` - Client activity (admin)
- `GET /api/reports/my-weekly-summary` - User's weekly summary
- `GET /api/reports/my-monthly-summary` - User's monthly summary

## 💰 Invoice & Payroll System

### Invoice Fields
- **Basic Information:** Name, Payroll Month, Invoice Date, Invoice Number
- **Financial:** Invoice Amount, Number of Hours
- **Client Details:** Client Name, End Client
- **Employment Type:** W2 or 1099 (with conditional 1099 Name field)
- **Status:** Pending, Received, Paid
- **Payment:** Payment Received Date, Notes

### Payroll Deductions

#### Deduction Types:
1. **1099/W2 Amount** - Employment type-specific deduction
2. **Unisys Tax** - Company tax deduction
3. **Unisys Charges** - Company service charges
4. **Custom Deductions** - Up to 3 configurable deductions with custom names

#### Calculation Logic:
```
Net Payable = Invoice Amount - Total Deductions

Total Deductions = (1099 Amount OR W2 Amount)
                 + Unisys Tax
                 + Unisys Charges
                 + Custom Deduction 1
                 + Custom Deduction 2
                 + Custom Deduction 3
```

#### Mutual Exclusivity:
- **1099/W2 Amount** and **Unisys Tax/Charges** are mutually exclusive
- When one is entered, the other is automatically disabled and cleared
- Prevents double deduction errors
- Custom deductions work with both methods

#### Override Option:
- Manual override of Net Payable calculation
- Useful for special cases or adjustments

## 🎨 Design System

### Color Scheme
- **Primary:** Navy Blue (#0f1d35)
- **Accent:** Blue (#3b82f6), Purple (#8b5cf6), Green (#10b981)
- **Status Colors:** 
  - Pending: Yellow/Orange
  - Received: Green
  - Paid: Blue
- **Employment Type:**
  - W2: Blue badge
  - 1099: Orange badge

### UI/UX Features
- **Dark Mode:** Fully implemented with gradient backgrounds
- **Responsive:** Mobile-first design
- **Modern Components:** Glassmorphism effects, smooth transitions
- **Smart Forms:** Conditional fields, real-time validation
- **Interactive Tables:** Hover effects, color-coded badges
- **Scrollable Modals:** Max-height with overflow handling
- **Empty State Handling:** Number fields show blank instead of "0"

## 📦 Tech Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM with schema validation
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework with hooks
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first styling
- **React Toastify** - Toast notifications
- **Lucide React** - Modern icon library

## 🔐 Security Features

- **JWT Authentication** with 24-hour expiration
- **Password Hashing** using bcrypt (10 rounds)
- **Role-Based Access Control** (Admin/Employer/Employee)
- **Input Validation** on all endpoints
- **CORS Protection** with whitelist
- **XSS Prevention** through sanitization
- **Environment Variables** for sensitive data
- **Secure HTTP Headers** via middleware

## 🔄 Development Workflow

### Backend Development
```bash
cd backend
npm run dev        # Start with nodemon (auto-reload)
npm start          # Production mode
npm test           # Run tests (if configured)
```

### Frontend Development
```bash
cd frontend
npm run dev        # Start dev server with HMR
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 📋 Database Schema

### Invoice Model
```javascript
{
  name: String,
  payrollMonth: String,
  invoiceDate: Date,
  invoiceNumber: String (unique),
  invoiceAmount: Number,
  numberOfHours: Number,
  clientName: String,
  endClient: String,              // NEW
  employmentType: Enum['W2', '1099'],  // NEW
  name1099: String,               // NEW (conditional)
  status: Enum['Pending', 'Received', 'Paid'],
  paymentReceivedDate: Date,
  notes: String,
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### PayrollDeduction Model
```javascript
{
  invoiceId: ObjectId (ref: Invoice, unique),
  amount1099: Number,
  amountW2: Number,
  unisysTax: Number,
  unisysCharges: Number,
  customDeduction1Name: String,     // NEW
  customDeduction1Amount: Number,   // NEW
  customDeduction2Name: String,     // NEW
  customDeduction2Amount: Number,   // NEW
  customDeduction3Name: String,     // NEW
  customDeduction3Amount: Number,   // NEW
  netPayable: Number (calculated),
  isOverride: Boolean,
  overrideAmount: Number,
  timestamps: true
}
```

## 🎯 Key Features Explained

### 1. Smart Deduction Logic
The system prevents conflicting deductions through mutual exclusivity:
- Choose **either** lump sum (1099/W2 Amount) **or** itemized (Unisys Tax + Charges)
- Cannot use both simultaneously
- Visual feedback with disabled fields and warning messages
- Custom deductions always available

### 2. Real-Time Calculations
- Net Payable updates as you type
- Instant validation feedback
- Calculation breakdown displayed
- No page refresh needed

### 3. Conditional Form Fields
- 1099 Name field appears only when 1099 is selected
- Smart form validation based on employment type
- Clean, uncluttered interface

### 4. Auto-Refresh Tables
- Invoice table automatically refreshes after deduction saves
- No manual refresh needed
- Always shows latest data

### 5. Enhanced Table Display
- End Client column for project tracking
- Employment Type badges with color coding
- 1099 Name shown inline when applicable
- Sortable and filterable columns

## 🚦 Usage Examples

### Creating an Invoice
1. Navigate to `/admin/invoices`
2. Click "Add Invoice"
3. Fill in employee details
4. Select Employment Type (W2 or 1099)
5. If 1099, enter 1099 Name
6. Add End Client information
7. Set invoice amount and hours
8. Save invoice

### Managing Deductions
1. Click the purple dollar icon on any invoice
2. Choose deduction method:
   - **Option A:** Enter 1099/W2 Amount
   - **Option B:** Enter Unisys Tax and/or Charges
3. Add custom deductions if needed
4. Review calculated Net Payable
5. Save deductions
6. Table automatically refreshes

### Calculation Example
```
Invoice Amount: $20,000
W2 Amount: $60
Custom Deduction 1 (Health Insurance): $200
Custom Deduction 2 (Retirement): $150

Total Deductions = $60 + $200 + $150 = $410
Net Payable = $20,000 - $410 = $19,590
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### Frontend
```javascript
// src/api/endpoints.js
const API_BASE_URL = 'http://localhost:5001/api';
```

## 🐛 Troubleshooting

### Backend Issues
- **MongoDB Connection Failed:** Check MONGODB_URI in .env
- **Port Already in Use:** Change PORT in .env or kill process on port 5001
- **JWT Errors:** Verify JWT_SECRET is set in .env

### Frontend Issues
- **API Connection Failed:** Verify backend is running on port 5001
- **CORS Errors:** Check CORS configuration in backend
- **Build Errors:** Clear node_modules and reinstall

### Common Fixes
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Kill process on port
lsof -ti:5001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Clear browser cache and localStorage
# Open DevTools > Application > Clear storage
```

## 🔄 Recent Updates

### Version 2.0 - Invoice System Enhancements
- ✅ Added End Client field for project tracking
- ✅ Implemented Employment Type (W2/1099) selection
- ✅ Added conditional 1099 Name field
- ✅ Created 3 custom deduction fields with names
- ✅ Implemented mutual exclusivity logic
- ✅ Added real-time net payable calculations
- ✅ Enhanced UI with empty field handling
- ✅ Made deductions modal scrollable
- ✅ Added auto-refresh after deduction saves
- ✅ Updated backend models and routes
- ✅ Improved table display with color-coded badges

## 📧 Contact

**UNISYS INFOTECH**
- Email: info@unisysinfotech.com
- Address: 20830 Torrence Chapel Rd Ste 203, Cornelius, NC 28031
- Website: www.unisysinfotech.com

## 📝 License

MIT License - See LICENSE file for details

---

**Built with ❤️ by the UNISYS INFOTECH Development Team**

© 2022 UNISYS INFOTECH. All rights reserved.
