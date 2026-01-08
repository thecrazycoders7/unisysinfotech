# UNISYS INFOTECH - API Documentation

## 📡 API Reference

Complete API documentation for the UNISYS INFOTECH Employee Management System.

**Base URL:** `http://localhost:5001/api` (Development)

**Production URL:** `https://your-domain.com/api`

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Register User

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "employee"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee"
    }
  }
}
```

**Errors:**
- `400` - Validation error (missing fields, invalid email)
- `409` - Email already exists

---

### Login

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Description:** Login to get JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee"
    }
  }
}
```

**Errors:**
- `400` - Invalid credentials
- `401` - Unauthorized

---

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Access:** Protected (All authenticated users)

**Description:** Get current user information

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `401` - Invalid or expired token

---

### Logout

**Endpoint:** `POST /api/auth/logout`

**Access:** Protected

**Description:** Logout user (client-side token removal)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📄 Invoice Management

### Get All Invoices

**Endpoint:** `GET /api/invoices`

**Access:** Protected (Admin/Employer)

**Description:** Get all invoices with optional filters

**Query Parameters:**
- `month` - Filter by payroll month (e.g., "January 2026")
- `name` - Filter by employee name
- `status` - Filter by status (Pending, Received, Paid)
- `search` - Search across multiple fields

**Example Request:**
```
GET /api/invoices?month=January%202026&status=Pending
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "payrollMonth": "January 2026",
        "invoiceDate": "2026-01-15T00:00:00.000Z",
        "invoiceNumber": "INV-2026-001",
        "invoiceAmount": 20000,
        "numberOfHours": 160,
        "clientName": "ABC Corp",
        "endClient": "XYZ Industries",
        "employmentType": "W2",
        "name1099": null,
        "status": "Pending",
        "paymentReceivedDate": null,
        "notes": "",
        "createdBy": "507f1f77bcf86cd799439012",
        "createdAt": "2026-01-01T00:00:00.000Z",
        "updatedAt": "2026-01-01T00:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

### Get Single Invoice

**Endpoint:** `GET /api/invoices/:id`

**Access:** Protected (Admin/Employer)

**Description:** Get single invoice with deductions

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "invoice": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "payrollMonth": "January 2026",
      "invoiceDate": "2026-01-15T00:00:00.000Z",
      "invoiceNumber": "INV-2026-001",
      "invoiceAmount": 20000,
      "numberOfHours": 160,
      "clientName": "ABC Corp",
      "endClient": "XYZ Industries",
      "employmentType": "W2",
      "name1099": null,
      "status": "Pending",
      "paymentReceivedDate": null,
      "notes": "",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    },
    "deductions": {
      "_id": "507f1f77bcf86cd799439013",
      "invoiceId": "507f1f77bcf86cd799439011",
      "amount1099": 0,
      "amountW2": 60,
      "unisysTax": 0,
      "unisysCharges": 0,
      "customDeduction1Name": "Health Insurance",
      "customDeduction1Amount": 200,
      "customDeduction2Name": "Retirement",
      "customDeduction2Amount": 150,
      "customDeduction3Name": "",
      "customDeduction3Amount": 0,
      "netPayable": 19590,
      "isOverride": false,
      "overrideAmount": 0,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

**Errors:**
- `404` - Invoice not found

---

### Create Invoice

**Endpoint:** `POST /api/invoices`

**Access:** Protected (Admin/Employer)

**Description:** Create a new invoice

**Request Body:**
```json
{
  "name": "John Doe",
  "payrollMonth": "January 2026",
  "invoiceDate": "2026-01-15",
  "invoiceNumber": "INV-2026-001",
  "invoiceAmount": 20000,
  "numberOfHours": 160,
  "clientName": "ABC Corp",
  "endClient": "XYZ Industries",
  "employmentType": "W2",
  "name1099": null,
  "status": "Pending",
  "paymentReceivedDate": null,
  "notes": "Q1 2026 invoice"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "invoice": { /* invoice object */ },
    "deductions": { /* default deductions object */ }
  }
}
```

**Errors:**
- `400` - Validation error or duplicate invoice number
- `401` - Unauthorized

---

### Update Invoice

**Endpoint:** `PUT /api/invoices/:id`

**Access:** Protected (Admin/Employer)

**Description:** Update an existing invoice

**Request Body:**
```json
{
  "name": "John Doe",
  "payrollMonth": "January 2026",
  "invoiceDate": "2026-01-15",
  "invoiceNumber": "INV-2026-001",
  "invoiceAmount": 20000,
  "numberOfHours": 160,
  "clientName": "ABC Corp",
  "endClient": "XYZ Industries Updated",
  "employmentType": "1099",
  "name1099": "John Doe LLC",
  "status": "Received",
  "paymentReceivedDate": "2026-01-20",
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Invoice updated successfully",
  "data": {
    "invoice": { /* updated invoice object */ }
  }
}
```

**Errors:**
- `404` - Invoice not found
- `400` - Validation error

---

### Delete Invoice

**Endpoint:** `DELETE /api/invoices/:id`

**Access:** Protected (Admin only)

**Description:** Delete an invoice and its deductions

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

**Errors:**
- `404` - Invoice not found
- `403` - Forbidden (not admin)

---

### Update Deductions

**Endpoint:** `PUT /api/invoices/:id/deductions`

**Access:** Protected (Admin/Employer)

**Description:** Update payroll deductions for an invoice

**Request Body:**
```json
{
  "amount1099": 0,
  "amountW2": 60,
  "unisysTax": 0,
  "unisysCharges": 0,
  "customDeduction1Name": "Health Insurance",
  "customDeduction1Amount": 200,
  "customDeduction2Name": "Retirement",
  "customDeduction2Amount": 150,
  "customDeduction3Name": "Other",
  "customDeduction3Amount": 50,
  "isOverride": false,
  "overrideAmount": 0
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Deductions updated successfully",
  "data": {
    "deductions": {
      "_id": "507f1f77bcf86cd799439013",
      "invoiceId": "507f1f77bcf86cd799439011",
      "amount1099": 0,
      "amountW2": 60,
      "unisysTax": 0,
      "unisysCharges": 0,
      "customDeduction1Name": "Health Insurance",
      "customDeduction1Amount": 200,
      "customDeduction2Name": "Retirement",
      "customDeduction2Amount": 150,
      "customDeduction3Name": "Other",
      "customDeduction3Amount": 50,
      "netPayable": 19540,
      "isOverride": false,
      "overrideAmount": 0,
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

**Note:** Net payable is automatically calculated on the backend.

**Calculation:**
```
netPayable = invoiceAmount - (
  amount1099 + 
  amountW2 + 
  unisysTax + 
  unisysCharges + 
  customDeduction1Amount + 
  customDeduction2Amount + 
  customDeduction3Amount
)
```

**Errors:**
- `404` - Invoice or deductions not found

---

### Get Pending Invoices

**Endpoint:** `GET /api/invoices/pending`

**Access:** Protected (Admin/Employer)

**Description:** Get pending invoices grouped by person

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "pendingByPerson": [
      {
        "name": "John Doe",
        "totalPending": 40000,
        "invoices": [
          {
            "_id": "507f1f77bcf86cd799439011",
            "invoiceNumber": "INV-2026-001",
            "payrollMonth": "January 2026",
            "invoiceAmount": 20000,
            "status": "Pending"
          },
          {
            "_id": "507f1f77bcf86cd799439014",
            "invoiceNumber": "INV-2026-002",
            "payrollMonth": "February 2026",
            "invoiceAmount": 20000,
            "status": "Pending"
          }
        ]
      }
    ]
  }
}
```

---

## ⏰ Time Card Management

### Get Time Cards

**Endpoint:** `GET /api/timecards`

**Access:** Protected (All authenticated users)

**Description:** Get time cards (users see only their own, admins see all)

**Query Parameters:**
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)
- `userId` - Filter by user (admin only)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "timecards": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "userId": "507f1f77bcf86cd799439011",
        "date": "2026-01-15T00:00:00.000Z",
        "hours": 8,
        "clientName": "ABC Corp",
        "projectName": "Website Redesign",
        "description": "Frontend development",
        "status": "Approved",
        "createdAt": "2026-01-15T00:00:00.000Z",
        "updatedAt": "2026-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

---

### Create Time Card

**Endpoint:** `POST /api/timecards`

**Access:** Protected (All authenticated users)

**Description:** Create a new time card entry

**Request Body:**
```json
{
  "date": "2026-01-15",
  "hours": 8,
  "clientName": "ABC Corp",
  "projectName": "Website Redesign",
  "description": "Frontend development work"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Time card created successfully",
  "data": {
    "timecard": { /* timecard object */ }
  }
}
```

---

### Update Time Card

**Endpoint:** `PUT /api/timecards/:id`

**Access:** Protected (Owner or Admin)

**Description:** Update a time card entry

**Request Body:**
```json
{
  "date": "2026-01-15",
  "hours": 9,
  "clientName": "ABC Corp",
  "projectName": "Website Redesign",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Time card updated successfully",
  "data": {
    "timecard": { /* updated timecard object */ }
  }
}
```

---

### Delete Time Card

**Endpoint:** `DELETE /api/timecards/:id`

**Access:** Protected (Owner or Admin)

**Description:** Delete a time card entry

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Time card deleted successfully"
}
```

---

## 📊 Reports

### Hours Summary Report

**Endpoint:** `GET /api/reports/hours-summary`

**Access:** Protected (Admin only)

**Description:** Get hours summary for all employees

**Query Parameters:**
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "userName": "John Doe",
        "totalHours": 160,
        "clients": [
          {
            "clientName": "ABC Corp",
            "hours": 100
          },
          {
            "clientName": "XYZ Inc",
            "hours": 60
          }
        ]
      }
    ]
  }
}
```

---

### Client Activity Report

**Endpoint:** `GET /api/reports/client-activity`

**Access:** Protected (Admin only)

**Description:** Get activity report by client

**Query Parameters:**
- `startDate` - Start date (ISO format)
- `endDate` - End date (ISO format)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "clientName": "ABC Corp",
        "totalHours": 320,
        "employees": [
          {
            "name": "John Doe",
            "hours": 160
          },
          {
            "name": "Jane Smith",
            "hours": 160
          }
        ]
      }
    ]
  }
}
```

---

### My Weekly Summary

**Endpoint:** `GET /api/reports/my-weekly-summary`

**Access:** Protected (All authenticated users)

**Description:** Get current user's weekly hours summary

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "weekStart": "2026-01-13T00:00:00.000Z",
    "weekEnd": "2026-01-19T00:00:00.000Z",
    "totalHours": 40,
    "dailyBreakdown": [
      {
        "date": "2026-01-13",
        "hours": 8
      },
      {
        "date": "2026-01-14",
        "hours": 8
      }
    ]
  }
}
```

---

### My Monthly Summary

**Endpoint:** `GET /api/reports/my-monthly-summary`

**Access:** Protected (All authenticated users)

**Description:** Get current user's monthly hours summary

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "month": "January 2026",
    "totalHours": 160,
    "weeklyBreakdown": [
      {
        "week": 1,
        "hours": 40
      },
      {
        "week": 2,
        "hours": 40
      },
      {
        "week": 3,
        "hours": 40
      },
      {
        "week": 4,
        "hours": 40
      }
    ]
  }
}
```

---

## ⚠️ Error Responses

### Standard Error Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Invalid or missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource not found)
- `409` - Conflict (Duplicate resource)
- `500` - Internal Server Error

---

## 🔒 Authorization Matrix

| Endpoint | Admin | Employer | Employee |
|----------|-------|----------|----------|
| POST /auth/register | ✅ | ✅ | ✅ |
| POST /auth/login | ✅ | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ | ✅ |
| GET /invoices | ✅ | ✅ | ❌ |
| POST /invoices | ✅ | ✅ | ❌ |
| PUT /invoices/:id | ✅ | ✅ | ❌ |
| DELETE /invoices/:id | ✅ | ❌ | ❌ |
| PUT /invoices/:id/deductions | ✅ | ✅ | ❌ |
| GET /timecards | ✅ (all) | ✅ (all) | ✅ (own) |
| POST /timecards | ✅ | ✅ | ✅ |
| PUT /timecards/:id | ✅ | ✅ | ✅ (own) |
| DELETE /timecards/:id | ✅ | ✅ | ✅ (own) |
| GET /reports/hours-summary | ✅ | ✅ | ❌ |
| GET /reports/client-activity | ✅ | ✅ | ❌ |
| GET /reports/my-weekly-summary | ✅ | ✅ | ✅ |
| GET /reports/my-monthly-summary | ✅ | ✅ | ✅ |

---

## 📝 Request Examples

### Using cURL

```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get invoices with token
curl -X GET http://localhost:5001/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create invoice
curl -X POST http://localhost:5001/api/invoices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "payrollMonth": "January 2026",
    "invoiceDate": "2026-01-15",
    "invoiceNumber": "INV-2026-001",
    "invoiceAmount": 20000,
    "numberOfHours": 160,
    "clientName": "ABC Corp",
    "endClient": "XYZ Industries",
    "employmentType": "W2",
    "status": "Pending"
  }'

# Update deductions
curl -X PUT http://localhost:5001/api/invoices/INVOICE_ID/deductions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amountW2": 60,
    "customDeduction1Name": "Health Insurance",
    "customDeduction1Amount": 200
  }'
```

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Set default headers
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Get invoices
const getInvoices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/invoices`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error.response.data);
  }
};

// Create invoice
const createInvoice = async (invoiceData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/invoices`, invoiceData);
    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error.response.data);
  }
};

// Update deductions
const updateDeductions = async (invoiceId, deductionsData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/invoices/${invoiceId}/deductions`,
      deductionsData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating deductions:', error.response.data);
  }
};
```

---

## 🧪 Testing

### Postman Collection

Import the following environment variables:
- `base_url`: `http://localhost:5001/api`
- `token`: Your JWT token (set after login)

### Test Data

**Admin User:**
```json
{
  "email": "admin@unisysinfotech.com",
  "password": "admin123"
}
```

**Test Invoice:**
```json
{
  "name": "Test Employee",
  "payrollMonth": "January 2026",
  "invoiceDate": "2026-01-15",
  "invoiceNumber": "TEST-001",
  "invoiceAmount": 20000,
  "numberOfHours": 160,
  "clientName": "Test Client",
  "endClient": "Test End Client",
  "employmentType": "W2",
  "status": "Pending"
}
```

---

**Last Updated:** January 2026  
**API Version:** 2.0  
**Base URL:** http://localhost:5001/api

© 2022 UNISYS INFOTECH. All rights reserved.
