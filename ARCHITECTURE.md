# UNISYS INFOTECH - System Architecture

## 📐 Architecture Overview

This document provides a comprehensive overview of the UNISYS INFOTECH Employee Management System architecture, including system design, data flow, and component interactions.

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Admin      │  │   Employer   │  │   Employee   │      │
│  │   Portal     │  │   Portal     │  │   Portal     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   React App     │
                    │   (Frontend)    │
                    │   Port: 5173    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   REST API      │
                    │   Express.js    │
                    │   Port: 5001    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   MongoDB       │
                    │   Database      │
                    └─────────────────┘
```

## 🔄 Data Flow Architecture

### Invoice & Payroll Deduction Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     INVOICE CREATION FLOW                     │
└──────────────────────────────────────────────────────────────┘

1. User Input (Frontend)
   ↓
2. Form Validation (React)
   ↓
3. API Request (Axios)
   POST /api/invoices
   ↓
4. Route Handler (Express)
   ↓
5. Input Validation (Express Validator)
   ↓
6. Business Logic
   - Check duplicate invoice number
   - Create invoice document
   - Create default PayrollDeduction
   ↓
7. Database Save (MongoDB)
   ↓
8. Response (JSON)
   ↓
9. UI Update (React State)
   ↓
10. Table Refresh (Auto)

┌──────────────────────────────────────────────────────────────┐
│                  DEDUCTION CALCULATION FLOW                   │
└──────────────────────────────────────────────────────────────┘

1. User Opens Deductions Modal
   ↓
2. Fetch Current Deductions
   GET /api/invoices/:id
   ↓
3. Display in Modal (React)
   ↓
4. User Enters Values
   ↓
5. Real-Time Calculation (Frontend)
   - Check mutual exclusivity
   - Calculate total deductions
   - Update Net Payable display
   ↓
6. User Saves
   PUT /api/invoices/:id/deductions
   ↓
7. Backend Calculation (Mongoose Pre-Save Hook)
   - Validate deductions
   - Calculate net payable
   - Save to database
   ↓
8. Response & Refresh
   - Success message
   - Close modal
   - Refresh invoice table
```

## 🗂️ Database Schema Design

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
│─────────────────│
│ _id             │
│ name            │
│ email           │◄──────────┐
│ password        │           │
│ role            │           │
│ createdAt       │           │
└─────────────────┘           │
                              │ createdBy
                              │
┌─────────────────┐           │
│    Invoice      │           │
│─────────────────│           │
│ _id             │           │
│ name            │           │
│ payrollMonth    │           │
│ invoiceDate     │           │
│ invoiceNumber   │           │
│ invoiceAmount   │           │
│ numberOfHours   │           │
│ clientName      │           │
│ endClient       │◄──────────┤
│ employmentType  │           │
│ name1099        │           │
│ status          │           │
│ paymentDate     │           │
│ notes           │           │
│ createdBy       │───────────┘
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:1
         │
         ▼
┌─────────────────────────┐
│   PayrollDeduction      │
│─────────────────────────│
│ _id                     │
│ invoiceId (unique)      │
│ amount1099              │
│ amountW2                │
│ unisysTax               │
│ unisysCharges           │
│ customDeduction1Name    │
│ customDeduction1Amount  │
│ customDeduction2Name    │
│ customDeduction2Amount  │
│ customDeduction3Name    │
│ customDeduction3Amount  │
│ netPayable (calculated) │
│ isOverride              │
│ overrideAmount          │
│ createdAt               │
│ updatedAt               │
└─────────────────────────┘

┌─────────────────┐
│    TimeCard     │
│─────────────────│
│ _id             │
│ userId          │───────┐
│ date            │       │
│ hours           │       │
│ clientName      │       │
│ projectName     │       │
│ description     │       │
│ status          │       │
│ createdAt       │       │
│ updatedAt       │       │
└─────────────────┘       │
                          │
                          └──────► User
```

## 🧩 Component Architecture

### Frontend Component Hierarchy

```
App.jsx
│
├── Router
│   │
│   ├── Public Routes
│   │   ├── Home
│   │   ├── About
│   │   ├── Services
│   │   └── Contact
│   │
│   ├── Auth Routes
│   │   ├── Login
│   │   └── Register
│   │
│   ├── Admin Routes (Protected)
│   │   ├── AdminDashboard
│   │   ├── InvoicesPayroll
│   │   │   ├── InvoiceTable
│   │   │   ├── InvoiceForm (Modal)
│   │   │   ├── DeductionsModal
│   │   │   │   ├── AmountFields (Conditional)
│   │   │   │   ├── UnisysFields (Conditional)
│   │   │   │   ├── CustomDeductionFields
│   │   │   │   └── NetPayableDisplay
│   │   │   └── PendingTracker
│   │   └── AdminReports
│   │
│   ├── Employer Routes (Protected)
│   │   ├── EmployerDashboard
│   │   └── EmployerTimeCards
│   │
│   └── Employee Routes (Protected)
│       ├── EmployeeDashboard
│       └── EmployeeTimeCards
│
└── Global Components
    ├── Navbar
    ├── Footer
    ├── Toast Notifications
    └── Loading Spinners
```

## 🔐 Authentication & Authorization Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                        │
└──────────────────────────────────────────────────────────────┘

1. User Login Request
   POST /api/auth/login
   { email, password }
   ↓
2. Backend Validation
   - Find user by email
   - Compare password hash
   ↓
3. Generate JWT Token
   - Payload: { id, email, role }
   - Expiration: 24 hours
   - Sign with JWT_SECRET
   ↓
4. Send Response
   {
     token: "jwt_token_here",
     user: { id, name, email, role }
   }
   ↓
5. Frontend Storage
   - Save token to localStorage
   - Save user to Zustand store
   ↓
6. Subsequent Requests
   - Add Authorization header
   - Bearer {token}
   ↓
7. Backend Middleware (auth.js)
   - Verify token
   - Decode payload
   - Attach user to req.user
   ↓
8. Route Handler
   - Access req.user
   - Check role permissions
   - Execute business logic
```

## 🎯 Business Logic Layer

### Invoice Management Logic

```javascript
// Invoice Creation Logic
1. Validate Input
   - Required fields present
   - Invoice number unique
   - Valid date formats
   - Positive amounts

2. Create Invoice Document
   - Set employment type (W2/1099)
   - Add end client information
   - Set initial status (Pending)
   - Link to creator (req.user.id)

3. Create Default Deductions
   - Link to invoice (invoiceId)
   - Initialize all amounts to 0
   - Set netPayable = invoiceAmount

4. Return Response
   - Invoice with deductions
   - Success message
```

### Deduction Calculation Logic

```javascript
// Net Payable Calculation
calculateNetPayable() {
  // Check for manual override
  if (isOverride) {
    return overrideAmount;
  }
  
  // Calculate total deductions
  const totalDeductions = 
    (amount1099 || 0) +           // 1099 deduction
    (amountW2 || 0) +              // W2 deduction
    (unisysTax || 0) +             // Unisys tax
    (unisysCharges || 0) +         // Unisys charges
    (customDeduction1Amount || 0) + // Custom 1
    (customDeduction2Amount || 0) + // Custom 2
    (customDeduction3Amount || 0);  // Custom 3
  
  // Calculate net payable
  return invoiceAmount - totalDeductions;
}

// Mutual Exclusivity Logic
onAmountChange(value, type) {
  if (type === '1099' || type === 'W2') {
    if (value > 0) {
      // Disable and clear Unisys fields
      unisysTax = 0;
      unisysCharges = 0;
    }
  }
  
  if (type === 'unisysTax' || type === 'unisysCharges') {
    if (value > 0) {
      // Disable and clear amount fields
      amount1099 = 0;
      amountW2 = 0;
    }
  }
}
```

## 🔄 State Management

### Zustand Store Structure

```javascript
// Auth Store
{
  user: {
    id: string,
    name: string,
    email: string,
    role: 'admin' | 'employer' | 'employee'
  },
  token: string,
  isAuthenticated: boolean,
  login: (credentials) => Promise,
  logout: () => void,
  checkAuth: () => Promise
}

// Invoice Store (Component Level)
{
  invoices: Invoice[],
  selectedInvoice: Invoice | null,
  deductions: PayrollDeduction,
  filters: {
    month: string,
    name: string,
    status: string,
    search: string
  },
  loading: boolean,
  showForm: boolean,
  showDeductions: boolean
}
```

## 🌐 API Layer Architecture

### API Endpoint Structure

```
/api
├── /auth
│   ├── POST   /register      # User registration
│   ├── POST   /login         # User login
│   ├── POST   /logout        # User logout
│   └── GET    /me            # Get current user
│
├── /invoices
│   ├── GET    /              # List all invoices (filtered)
│   ├── GET    /:id           # Get single invoice + deductions
│   ├── POST   /              # Create new invoice
│   ├── PUT    /:id           # Update invoice
│   ├── DELETE /:id           # Delete invoice
│   ├── PUT    /:id/deductions # Update deductions
│   └── GET    /pending       # Get pending invoices
│
├── /timecards
│   ├── GET    /              # List time cards
│   ├── GET    /:id           # Get single time card
│   ├── POST   /              # Create time card
│   ├── PUT    /:id           # Update time card
│   └── DELETE /:id           # Delete time card
│
└── /reports
    ├── GET    /hours-summary        # Admin hours report
    ├── GET    /client-activity      # Client activity report
    ├── GET    /my-weekly-summary    # User weekly report
    └── GET    /my-monthly-summary   # User monthly report
```

## 🛡️ Security Architecture

### Security Layers

```
┌──────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                          │
└──────────────────────────────────────────────────────────────┘

1. Transport Layer
   ├── HTTPS (Production)
   ├── CORS Configuration
   └── Secure Headers

2. Authentication Layer
   ├── JWT Tokens (24h expiration)
   ├── Password Hashing (bcrypt, 10 rounds)
   └── Token Validation Middleware

3. Authorization Layer
   ├── Role-Based Access Control
   ├── Route Protection
   └── Resource Ownership Checks

4. Input Validation Layer
   ├── Express Validator
   ├── Mongoose Schema Validation
   └── Frontend Form Validation

5. Data Layer
   ├── MongoDB Security
   ├── Connection String Encryption
   └── Environment Variables
```

### Authentication Middleware Flow

```javascript
// Middleware Chain
Request
  ↓
1. CORS Middleware
   - Check origin
   - Set headers
  ↓
2. Body Parser
   - Parse JSON
   - Limit size
  ↓
3. Auth Middleware (Protected Routes)
   - Extract token
   - Verify JWT
   - Decode payload
   - Attach user to request
  ↓
4. Role Check Middleware (Admin Routes)
   - Check req.user.role
   - Allow/Deny access
  ↓
5. Route Handler
   - Execute business logic
   - Access req.user
  ↓
Response
```

## 📊 Performance Considerations

### Optimization Strategies

1. **Database Indexing**
   ```javascript
   // Invoice indexes
   invoiceNumber: { unique: true, index: true }
   createdBy: { index: true }
   status: { index: true }
   payrollMonth: { index: true }
   
   // PayrollDeduction indexes
   invoiceId: { unique: true, index: true }
   ```

2. **Query Optimization**
   - Use projection to limit returned fields
   - Implement pagination for large datasets
   - Use lean() for read-only queries
   - Populate only necessary references

3. **Frontend Optimization**
   - Lazy loading for routes
   - Memoization for expensive calculations
   - Debouncing for search inputs
   - Virtual scrolling for large tables

4. **Caching Strategy**
   - Browser caching for static assets
   - API response caching (future)
   - LocalStorage for user preferences

## 🔧 Error Handling Architecture

### Error Flow

```
Error Occurs
  ↓
Backend Error Handler
  ├── Mongoose Validation Error → 400
  ├── JWT Error → 401
  ├── Authorization Error → 403
  ├── Not Found Error → 404
  ├── Duplicate Key Error → 409
  └── Server Error → 500
  ↓
Formatted Error Response
  {
    success: false,
    message: "Error description",
    errors: [...] // Validation errors
  }
  ↓
Frontend Error Handler
  ├── Display Toast Notification
  ├── Log to Console (Dev)
  └── Update UI State
```

## 🚀 Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────┘

Frontend (Vercel/Netlify)
  ├── React Build (Static)
  ├── CDN Distribution
  └── Environment Variables
      └── VITE_API_URL

Backend (Railway/Heroku/AWS)
  ├── Node.js Server
  ├── PM2 Process Manager
  └── Environment Variables
      ├── MONGODB_URI
      ├── JWT_SECRET
      └── PORT

Database (MongoDB Atlas)
  ├── Replica Set
  ├── Automated Backups
  └── Connection Pooling
```

## 📈 Scalability Considerations

### Horizontal Scaling

1. **Stateless Backend**
   - JWT tokens (no session storage)
   - Can run multiple instances
   - Load balancer ready

2. **Database Scaling**
   - MongoDB sharding support
   - Read replicas for queries
   - Connection pooling

3. **Frontend Scaling**
   - CDN distribution
   - Static asset caching
   - Code splitting

### Vertical Scaling

1. **Backend Optimization**
   - Async/await patterns
   - Stream processing for large data
   - Worker threads for CPU-intensive tasks

2. **Database Optimization**
   - Index optimization
   - Query performance monitoring
   - Aggregation pipeline optimization

## 🔍 Monitoring & Logging

### Logging Strategy

```javascript
// Backend Logging
- Request logging (Morgan)
- Error logging (Winston)
- Database query logging
- Authentication attempts

// Frontend Logging
- Error boundary logging
- API call logging (Dev)
- User action tracking
- Performance metrics
```

## 📝 Future Architecture Enhancements

1. **Microservices**
   - Separate invoice service
   - Separate time tracking service
   - API Gateway

2. **Real-Time Features**
   - WebSocket integration
   - Live invoice updates
   - Real-time notifications

3. **Advanced Caching**
   - Redis integration
   - Query result caching
   - Session management

4. **Message Queue**
   - Background job processing
   - Email notifications
   - Report generation

---

**Last Updated:** January 2026
**Version:** 2.0

© 2022 UNISYS INFOTECH. All rights reserved.
