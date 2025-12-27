# DEPLOYMENT GUIDE

## Prerequisites

- GitHub account
- MongoDB Atlas account (free tier available)
- Vercel account (for frontend)
- Railway/Render account (for backend)
- Domain: unisysinfotech.com (or similar)

---

## PHASE 1: LOCAL DEVELOPMENT SETUP

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Create MongoDB Atlas cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/unisys_infotech`

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/unisys_infotech
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=24h
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start backend:**
   ```bash
   npm run dev
   ```
   
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env.local`:**
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```
   
   App runs on `http://localhost:5173`

---

## PHASE 2: DATABASE SETUP

### MongoDB Collections

The backend automatically creates collections on first use. Seeds can be added in `backend/src/scripts/seedData.js`:

```javascript
// Example seed data
const adminUser = {
  name: 'Admin User',
  email: 'admin@unisysinfotech.com',
  password: 'securePassword123',
  role: 'admin'
};

const sampleClient = {
  name: 'Tech Corp Inc',
  email: 'contact@techcorp.com',
  industry: 'Technology',
  contactPerson: 'John Doe',
  phone: '+1-555-0100',
  address: '123 Tech Avenue, Silicon Valley, CA 94025'
};
```

---

## PHASE 3: PRODUCTION DEPLOYMENT

### Option A: Deploy to Vercel + Railway

#### Frontend Deployment (Vercel)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/unisys-infotech.git
   git push -u origin main
   ```

2. **Connect Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Framework: Vite
   - Root Directory: `frontend`
   - Set Environment Variable:
     ```
     VITE_API_URL=https://your-backend-domain.com/api
     ```
   - Deploy!

#### Backend Deployment (Railway)

1. **Connect Railway:**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repo
   - Set Root Directory: `backend`

2. **Add Environment Variables in Railway Dashboard:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/unisys_infotech
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=24h
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   FRONTEND_URL=https://your-frontend-domain.com
   ```

3. **Note your Railway backend URL** (e.g., `https://project-name-prod.up.railway.app`)

#### Update Frontend API URL

After backend deployment:
1. Go to Vercel Dashboard
2. Project → Settings → Environment Variables
3. Update `VITE_API_URL` to your Railway backend URL
4. Redeploy

### Option B: Deploy to AWS (Alternative)

**Frontend:**
- S3 bucket + CloudFront

**Backend:**
- EC2 or Elastic Beanstalk
- RDS for MongoDB Atlas alternative (use PostgreSQL)

---

## PHASE 4: DOMAIN CONFIGURATION

### Setting up unisysinfotech.com

1. **DNS Records** (with your domain registrar):
   
   For Vercel Frontend:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
   
   For root domain:
   ```
   Type: A
   Name: @
   Value: 76.76.19.21  (Vercel IP)
   ```

2. **Vercel Domain Settings:**
   - Project → Settings → Domains
   - Add: `unisysinfotech.com` and `www.unisysinfotech.com`

3. **Backend API Subdomain:**
   ```
   Type: CNAME
   Name: api
   Value: your-railway-url (or EC2 Elastic IP)
   ```

---

## PHASE 5: SSL/HTTPS

- **Vercel**: Automatic SSL (free)
- **Railway**: Automatic SSL (free)
- **Custom Domain**: Use Cloudflare (free) for additional protection

---

## PHASE 6: MONITORING & LOGGING

### Backend Logging (Railway)

- Railway dashboard shows real-time logs
- Set up alerts for errors

### Frontend Monitoring (Vercel)

- Vercel Analytics
- Set up error tracking with Sentry

### Add Error Tracking (Optional)

```javascript
// In frontend src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

---

## PHASE 7: CONTINUOUS INTEGRATION/DEPLOYMENT

### GitHub Actions (Auto Deploy on Push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway/Vercel
        # Auto-deploys via GitHub integration
```

---

## TESTING BEFORE PRODUCTION

### Checklist

- [ ] Login functionality works
- [ ] Admin can create/edit/delete clients
- [ ] Users can log hours
- [ ] Hours appear in history
- [ ] Reports generate correctly
- [ ] Dark mode toggles properly
- [ ] Mobile responsive on all pages
- [ ] Forms validate input
- [ ] Error messages display
- [ ] Database persists data
- [ ] API rate limiting works
- [ ] CORS properly configured

### Test Credentials

```
Admin:
Email: admin@unisysinfotech.com
Password: AdminPassword123

User:
Email: user@unisysinfotech.com
Password: UserPassword123
```

---

## BACKUP & RECOVERY

### MongoDB Backup (Atlas)

1. Go to MongoDB Atlas Dashboard
2. Cluster → Backup
3. Enable automatic backups (default: every 6 hours)
4. Set retention to 35 days

### GitHub Backup

All code is automatically backed up in Git:
```bash
git clone https://github.com/yourusername/unisys-infotech.git
```

---

## TROUBLESHOOTING

### Common Issues

**1. CORS Error**
- Check `FRONTEND_URL` in backend `.env`
- Ensure frontend is in allowed origins

**2. Database Connection Failed**
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Test connection with MongoDB Compass

**3. Vercel/Railway Deploy Failed**
- Check build logs in dashboard
- Ensure all dependencies in package.json
- Verify environment variables are set

**4. API Not Responding**
- Check backend logs in Railway
- Verify MONGODB_URI is accessible
- Check PORT environment variable

---

## SECURITY BEST PRACTICES

✅ **Already Implemented:**
- Password hashing with bcrypt
- JWT authentication
- Input validation
- CORS protection
- Environment variables for secrets

**Still Needed:**
- [ ] Add rate limiting (express-rate-limit)
- [ ] Implement CSRF tokens
- [ ] Set secure headers (helmet.js)
- [ ] Regular security audits
- [ ] Keep dependencies updated

```bash
# Add security packages
npm install express-rate-limit helmet express-mongo-sanitize
```

---

## PERFORMANCE OPTIMIZATION

### Frontend

```bash
npm run build
npm run preview  # Test production build
```

### Backend

- Add caching (Redis)
- Database indexing (MongoDB)
- Compression middleware
- CDN for static files (Cloudflare)

---

## COST ESTIMATION (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| MongoDB Atlas | ✅ Yes | $57+ |
| Vercel | ✅ Yes | $20/month |
| Railway | ✅ Yes (credits) | $5-20 |
| Domain | - | $10-15 |
| Cloudflare | ✅ Yes | $20+ |
| **Total** | **$0** | **~$50-70** |

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Monitor Performance**
   - Set up Lighthouse CI
   - Monitor Core Web Vitals

2. **Collect User Feedback**
   - Implement feedback widget
   - Track feature usage

3. **Plan Enhancements**
   - Email notifications
   - Mobile app (React Native)
   - Advanced reporting

4. **Maintain & Update**
   - Monthly security patches
   - Quarterly feature releases
   - Annual architecture review

---

## SUPPORT & CONTACT

For deployment assistance:
- Email: info@unisysinfotech.com
- Documentation: See README.md
- GitHub Issues: Report bugs

---

**Last Updated:** December 2024
**Version:** 1.0.0
