# Complete Setup Guide for Compliance Checklist Application

This guide will walk you through setting up and running the Compliance Checklist application from scratch.


cd C:\Personal\Compliance_Checklist\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver



cd C:\Personal\Compliance_Checklist\frontend
npm install
npm start

## Prerequisites

Before starting, ensure you have the following installed on your Windows machine:

1. **Python 3.8 or higher**
   - Download from: https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"
   - Verify: Open PowerShell and run `python --version`

2. **Node.js 16 or higher**
   - Download from: https://nodejs.org/
   - This includes npm (Node Package Manager)
   - Verify: Run `node --version` and `npm --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Step-by-Step Setup Instructions

### Part 1: Backend Setup (Django)

#### Step 1: Open PowerShell
Press `Win + X` and select "Windows PowerShell" or "Terminal"

#### Step 2: Navigate to the project directory
```powershell
cd C:\Personal\Compliance_Checklist
```

#### Step 3: Create Python Virtual Environment
A virtual environment isolates Python dependencies for this project.

```powershell
# Create virtual environment named 'venv'
python -m venv venv
```

**What this does:** Creates a folder called `venv` containing a separate Python installation for our project.

#### Step 4: Activate Virtual Environment
```powershell
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# If you get an execution policy error, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try activating again:
.\venv\Scripts\Activate.ps1
```

**How to know it worked:** Your terminal prompt will show `(venv)` at the beginning.

#### Step 5: Install Backend Dependencies
Navigate to the backend folder and install required Python packages:

```powershell
cd backend
pip install -r requirements.txt
```

**What this installs:**
- Django - Web framework
- Django REST Framework - For building APIs
- CORS headers - For frontend-backend communication
- Other utilities

This may take 1-2 minutes.

#### Step 6: Create Database Tables
Django needs to create tables in the SQLite database:

```powershell
# Create migration files (if not already created)
python manage.py makemigrations

# Apply migrations to create database tables
python manage.py migrate
```

**What this does:** Creates db.sqlite3 file with all necessary tables.

#### Step 7: Create Admin Superuser
Create an admin account to access the Django admin panel:

```powershell
python manage.py createsuperuser
```

You'll be prompted to enter:
- Username (e.g., admin)
- Email (can leave blank by pressing Enter)
- Password (type carefully, characters won't show)
- Password confirmation

**Remember these credentials!** You'll use them to log in.

#### Step 8: Start Django Development Server
```powershell
python manage.py runserver
```

**Success!** If you see:
```
Starting development server at http://127.0.0.1:8000/
```

Your backend is running! Keep this terminal open.

**Test it:** Open browser and go to:
- http://localhost:8000/admin/ - Django admin interface
- Log in with your superuser credentials

### Part 2: Frontend Setup (React)

#### Step 9: Open a NEW PowerShell Terminal
Don't close the backend terminal! Open a new one:
Press `Win + X` → "Windows PowerShell"

#### Step 10: Navigate to Frontend Directory
```powershell
cd C:\Personal\Compliance_Checklist\frontend
```

#### Step 11: Install Frontend Dependencies
```powershell
npm install
```

**What this installs:**
- React - Frontend library
- React Router - For navigation
- Axios - For API calls
- Tailwind CSS - For styling
- Vite - Build tool

This may take 2-3 minutes. You'll see a progress bar.

#### Step 12: Start React Development Server
```powershell
npm start
```

**Success!** If you see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Your frontend is running!

#### Step 13: Open the Application
Open your browser and go to:
```
http://localhost:3000
```

You should see the login page!

## Using the Application

### First Time Use

1. **Register a New Account**
   - Click "create a new account" on the login page
   - Fill in the registration form
   - Click "Create account"
   - You'll be automatically logged in and redirected to the dashboard

2. **Create Your First Checklist**
   - Click "+ Create New Checklist" button
   - Fill in:
     - Name: e.g., "Q1 2026 Security Audit"
     - Description: What this checklist is for
     - Due Date: Select a date
     - Status: Start with "Active"
   - Click "Create Checklist"

3. **Add Items to Checklist**
   - Click on the checklist you just created
   - Click "+ Add Item" button
   - Fill in item details:
     - Title: e.g., "Review firewall rules"
     - Description: More details
     - Assigned Owner: Person responsible
   - Click "Add Item"
   - Repeat for more items

4. **Track Progress**
   - Change item status using the dropdown
   - Mark items as: Pending → In Progress → Completed
   - View overall progress on the dashboard
   - Dashboard shows statistics and completion percentages

### Admin Panel Usage

To manage data through Django admin:

1. Go to http://localhost:8000/admin/
2. Log in with superuser credentials
3. You can:
   - View all users, checklists, and items
   - Edit data directly
   - Manage user accounts
   - View system logs

## Troubleshooting

### Backend Issues

**Problem: "python is not recognized"**
- Solution: Reinstall Python and check "Add Python to PATH"

**Problem: Cannot activate virtual environment**
- Solution: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**Problem: Port 8000 already in use**
- Solution: Stop other Django servers or use: `python manage.py runserver 8001`

**Problem: Migration errors**
- Solution: Delete `db.sqlite3` and `*/migrations/00*.py` files (keep `__init__.py`), then run migrations again

### Frontend Issues

**Problem: "npm is not recognized"**
- Solution: Reinstall Node.js

**Problem: Port 3000 already in use**
- Solution: Stop other React apps or the Vite server will prompt you to use a different port

**Problem: Can't connect to backend**
- Solution: Ensure Django is running on port 8000

### CORS Issues

**Problem: "CORS policy" error in browser console**
- Solution: Check that `CORS_ALLOWED_ORIGINS` in settings.py includes `http://localhost:3000`

## Project Structure Explained

```
C:\Personal\Compliance_Checklist\
├── backend/                    # Django backend
│   ├── compliance_api/         # Main Django project settings
│   │   ├── settings.py        # Configuration (database, apps, CORS)
│   │   └── urls.py            # Main URL routing
│   ├── users/                 # User authentication app
│   │   ├── models.py          # User data models
│   │   ├── views.py           # Login/register/logout endpoints
│   │   └── serializers.py     # Data validation
│   ├── checklists/            # Checklist management app
│   │   ├── models.py          # Checklist & Item models
│   │   ├── views.py           # CRUD operations
│   │   ├── serializers.py     # Data validation
│   │   └── admin.py           # Admin interface config
│   ├── manage.py              # Django management script
│   ├── db.sqlite3             # Database (created after migrations)
│   └── requirements.txt       # Python dependencies
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Login.jsx     # Login page
│   │   │   ├── Register.jsx  # Registration page
│   │   │   ├── Dashboard.jsx # Main dashboard
│   │   │   ├── ChecklistList.jsx
│   │   │   ├── ChecklistDetail.jsx
│   │   │   └── CreateChecklist.jsx
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/          # Global state
│   │   │   └── AuthContext.jsx
│   │   ├── services/         # API calls
│   │   │   └── api.js
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Tailwind CSS config
│
└── README.md                 # This file
```

## Key Files Explained

### Backend Key Files

- **settings.py**: Contains all Django configuration including database, installed apps, CORS settings
- **models.py**: Defines database structure (tables, fields, relationships)
- **views.py**: Handles HTTP requests and returns responses
- **serializers.py**: Validates incoming data and formats outgoing data
- **urls.py**: Maps URLs to views (routing)

### Frontend Key Files

- **App.jsx**: Sets up routing and authentication
- **AuthContext.jsx**: Manages user login state across the app
- **api.js**: Centralizes all API calls to backend
- **index.css**: Contains Tailwind CSS and custom styles
- **pages/*.jsx**: Individual page components

## Virtual Environment Explained

### What is a Virtual Environment?
A virtual environment is an isolated Python environment that:
- Keeps project dependencies separate
- Prevents conflicts between different projects
- Makes it easy to reproduce the exact setup

### Important Commands

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Deactivate (when done working)
deactivate

# Check installed packages
pip list

# Install new package
pip install package-name

# Update requirements.txt after installing new packages
pip freeze > requirements.txt
```

## Development Workflow

### Daily Startup Routine

1. **Start Backend:**
   ```powershell
   cd C:\Personal\Compliance_Checklist\backend
   .\venv\Scripts\Activate.ps1
   python manage.py runserver
   ```

2. **Start Frontend (new terminal):**
   ```powershell
   cd C:\Personal\Compliance_Checklist\frontend
   npm start
   ```

3. **Open browser:** http://localhost:3000

### Stopping the Application

1. In each terminal, press `Ctrl + C`
2. Deactivate virtual environment: `deactivate`

## Next Steps

- Explore the Django admin panel
- Create multiple checklists and items
- Try different filters and search on the checklist page
- Monitor the dashboard statistics
- Read API_DOCUMENTATION.md for API details

## Support

If you encounter issues not covered here:
1. Check browser console for errors (F12)
2. Check terminal output for error messages
3. Review the error messages carefully - they often indicate the problem
4. Make sure both backend and frontend are running

## Summary

You now have a fully functional Compliance Checklist application running locally!

- **Backend:** http://localhost:8000 (Django + SQLite)
- **Frontend:** http://localhost:3000 (React + Tailwind CSS)
- **Admin:** http://localhost:8000/admin/

Happy compliance tracking! 🎉
