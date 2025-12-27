# Client Logos Management Guide

## Overview
The homepage now displays logos from 11 prestigious clients, showcasing Unisys Infotech's partnerships with leading organizations.

## Current Client Logos (in display order)

1. **First Citizens Bank** - Banking & Financial Services
2. **Cisco** - Networking, Cloud, Cybersecurity
3. **SunLine** - Public Transportation
4. **FIS** - FinTech
5. **City of Memphis** - Government / Public Administration
6. **Apolis** - IT Consulting & Staffing
7. **Dorpass** - Technology Solutions
8. **InfoVision** - IT Services & Digital Transformation
9. **4i** - Data Analytics & Business Intelligence
10. **Houlihan Lokey** - Investment Banking
11. **Oracle** - Enterprise Software & Cloud

## Logo Sources
All logos are fetched from Clearbit Logo API which provides official company logos:
- Format: `https://logo.clearbit.com/[company-domain]`
- Fallback: Placeholder images with company names

## Admin Management

### Accessing Client Logo Management
1. Login as admin: `admin@unisysinfotech.com` / `password123`
2. Navigate to **Admin Panel** → **Client Logos**
3. Route: `http://localhost:5173/admin/client-logos`

### Available CRUD Operations

#### View All Logos
- See all client logos with their details
- View active/inactive status
- See display order

#### Add New Client Logo
1. Click **"Add New Client Logo"** button
2. Fill in the form:
   - **Name**: Company name (required)
   - **Industry**: Business sector (required)
   - **Logo URL**: Full URL to company logo (required)
   - **Description**: Brief description of company
   - **Founded**: Year established
   - **Headquarters**: Location
   - **Trust Signal**: Why this client matters
   - **Display Order**: Number for sorting (0-999)
   - **Is Active**: Toggle visibility on homepage
3. Click **"Save"**

#### Edit Existing Logo
1. Click **Edit** icon next to any logo
2. Modify fields as needed
3. Click **"Save"**

#### Delete Logo
1. Click **Delete** icon next to any logo
2. Confirm deletion in popup
3. Logo will be permanently removed

#### Toggle Active Status
- Use the **Is Active** checkbox to show/hide logos on homepage
- Inactive logos remain in database but won't display publicly

## Frontend Display

### Homepage Section
- **Location**: Below "Trust Metrics" section
- **Title**: "Our Clients"
- **Subtitle**: "Trusted by Leading Organizations"
- **Animation**: Infinite horizontal scroll with hover effects
- **Effects**:
  - Grayscale by default
  - Full color on hover
  - Smooth fade-in/out at edges
  - Pause animation on hover

### Styling Features
- Cards with rounded corners
- Gradient fade at edges
- Hover effects (color restoration)
- Responsive grid layout
- Fallback for failed logo loads

## API Endpoints

### Public Endpoints
- **GET** `/api/client-logos` - Get all active logos (sorted by displayOrder)

### Admin-Only Endpoints (requires authentication)
- **GET** `/api/client-logos/all` - Get all logos including inactive
- **GET** `/api/client-logos/:id` - Get single logo by ID
- **POST** `/api/client-logos` - Create new logo
- **PUT** `/api/client-logos/:id` - Update existing logo
- **DELETE** `/api/client-logos/:id` - Delete logo

## Database Schema

```javascript
{
  name: String (required),          // "Oracle"
  industry: String (required),      // "Enterprise Software & Cloud"
  logoUrl: String (required),       // "https://logo.clearbit.com/oracle.com"
  description: String,              // Brief company description
  founded: String,                  // "1977"
  headquarters: String,             // "Austin, Texas, USA"
  trustSignal: String,              // Why this client matters
  displayOrder: Number (default 0), // Sorting order
  isActive: Boolean (default true), // Show/hide on homepage
  timestamps: true                  // createdAt, updatedAt
}
```

## Re-seeding Logos
To reset logos to the default 11 companies:

```bash
cd /private/tmp/unisys-infotech/backend
node src/scripts/seedClientLogos.js
```

This will:
1. Clear all existing logos
2. Insert the 11 default companies
3. Display success message with count

## Best Practices

### Logo URLs
- Use Clearbit API: `https://logo.clearbit.com/[domain]`
- Alternative: Company's official website `/logo.png`
- Fallback: Placeholder will auto-generate if URL fails

### Display Order
- Lower numbers appear first (left to right)
- Use increments of 10 (10, 20, 30) to allow easy reordering
- 0 is valid and will display first

### Trust Signals
Write compelling reasons why this client matters:
- ✅ "Powers core financial systems for global banks"
- ✅ "Fortune 500 enterprise partner"
- ❌ "A client we work with"

### Inactive Logos
- Use inactive status instead of deleting
- Preserves historical client data
- Easy to reactivate later

## Troubleshooting

### Logos Not Displaying
1. Check if logos are marked as **isActive: true**
2. Verify API is running: `curl http://localhost:5001/api/client-logos`
3. Check browser console for errors
4. Verify logo URLs are accessible

### Logo Image Not Loading
- Clearbit may not have the logo for some domains
- System automatically shows fallback placeholder
- Update logoUrl to company's direct logo URL

### Admin Can't Edit Logos
- Verify user role is **"admin"**
- Check authentication token is valid
- Ensure backend auth middleware is working

## Security Notes

- Only authenticated admin users can modify logos
- Public endpoint only returns active logos
- All admin routes protected by JWT authentication
- Role-based access control enforced

## Future Enhancements

Potential improvements:
- Upload custom logo files
- Drag-and-drop reordering
- Logo categories/filtering
- Analytics on logo performance
- A/B testing different logo sets
- Image optimization/CDN integration

---

**Last Updated**: December 24, 2025
**Version**: 1.0
