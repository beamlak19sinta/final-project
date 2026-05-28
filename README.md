# Dagmawi Menelik Digital Service - Quick Start Guide

This project is a management system for digital services. Follow these simple steps to get it running.

## 🛠️ Easy Setup

1. **Open your terminal**.
2. **Navigate to the project folder**.
3. **Run the setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   *(Wait for it to finish. It will install everything and set up the database for you.)*

## 🚀 How to Run

To start the project, you need to run both the **Backend** and the **Frontend**.

### 1. Start the Backend (Server)
Open a new terminal in the `backend` folder and run:
```bash
npm run dev
```

### 2. Start the Frontend (Website)
Open another terminal in the `frontend` folder and run:
```bash
npm run dev
```

The website will be available at: **http://localhost:5173**

---

## 🔐 Login Credentials

Use these accounts to test the system:

| Role | Phone Number | Password |
|------|--------------|----------|
| **Admin** | `0911111111` | `admin123` |
| **Officer** | `0900000000` | `officer123` |
| **Citizen** | `0909090909` | `password123` |

---

## 📝 Important Notes
- Make sure **PostgreSQL** is running on your computer.
- If you have issues, try running the `./setup.sh` script again.