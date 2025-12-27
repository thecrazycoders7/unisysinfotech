# Test Credentials

All users have the same password: **password123**

## Admin Account
- **Email:** admin@unisysinfotech.com
- **Password:** password123
- **Access:** Full system access
  - User management (create/edit/delete users)
  - View all reports
  - Manage job postings
  - View all timecards

## Employer Account
- **Email:** employer@unisysinfotech.com
- **Password:** password123
- **Name:** John Manager
- **Access:** Employer features
  - View weekly team dashboard
  - See all employee timecards
  - View employee list

## Employee Accounts

### Employee 1
- **Email:** employee@unisysinfotech.com
- **Password:** password123
- **Name:** Sarah Smith
- **Employer:** John Manager
- **Access:** Employee features
  - Submit timecard entries
  - View own hours history
  - Calendar interface for logging hours

### Employee 2
- **Email:** employee2@unisysinfotech.com
- **Password:** password123
- **Name:** Mike Johnson
- **Employer:** John Manager
- **Access:** Employee features
  - Submit timecard entries
  - View own hours history
  - Calendar interface for logging hours

## Regular User Account
- **Email:** user@unisysinfotech.com
- **Password:** password123
- **Name:** Jane Doe
- **Access:** User features
  - User dashboard
  - Log hours
  - View hours history

---

## How to Test

1. Visit `http://localhost:5173`
2. Click the profile icon in the top right
3. Select your role (Admin/Employer/Employee)
4. Login with the appropriate credentials above
5. Explore the pages based on your role

## Features by Role

### Admin Can Access:
- `/admin` - Admin dashboard
- `/admin/users` - User management (create/edit/delete employers & employees)
- `/admin/jobs` - Job postings management
- `/admin/clients` - Client management
- `/admin/reports` - Reports and analytics

### Employer Can Access:
- `/employer/dashboard` - Weekly team timecard dashboard
- View all employees under their management
- See weekly hours summary

### Employee Can Access:
- `/employee/timecards` - Calendar-based timecard entry
- Submit daily hours (0-24 hours)
- Add notes to entries
- View locked/unlocked entries

### Regular User Can Access:
- `/user` - User dashboard
- `/user/log-hours` - Log hours
- `/user/hours-history` - View history
