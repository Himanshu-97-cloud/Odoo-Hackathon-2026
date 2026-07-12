# 🚛 TransitOps

**TransitOps** is a full-stack fleet and transport operations management platform built for the **Odoo Hackathon 2026**.

It helps organizations manage vehicles, drivers, trips, maintenance, fuel expenses, and fleet operations from a centralized dashboard.

## ✨ Features

- User registration and login
- JWT-based authentication
- Role-based access control
- Fleet dashboard
- Vehicle management
- Driver management
- Trip management
- Maintenance tracking
- Fuel and expense management
- Analytics and reports
- Dark and light mode
- Responsive user interface

## 👥 User Roles

TransitOps supports four user roles:

- **Fleet Manager** — Manages vehicles, drivers, and fleet operations.
- **Dispatcher** — Manages trips and vehicle assignments.
- **Safety Officer** — Monitors vehicle maintenance and safety.
- **Financial Analyst** — Tracks fuel costs, expenses, and analytics.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Lucide React

### Backend
- Python
- FastAPI
- JWT Authentication
- bcrypt password hashing

### Database
- MongoDB Atlas
- PyMongo

## 📁 Project Structure

```text
Odoo-Hackathon-2026/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   └── requirements.txt
│
└── README.md
```

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Odoo-Hackathon-2026
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

### 3. Start the backend

Open another terminal:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 4. Create the environment file

Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=your_mongodb_atlas_connection_string
DATABASE_NAME=transitops
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
```

> Never upload the `.env` file to GitHub.

### 5. Start FastAPI

```bash
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

## 🔐 Authentication API

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |
| GET | `/api/auth/me` | Get the logged-in user |

## 🚗 Main Modules

```text
Dashboard
Vehicles
Drivers
Trips
Maintenance
Fuel & Expenses
Analytics
Settings
```

## 🔒 Security

- Passwords are hashed before being stored.
- JWT tokens protect authenticated routes.
- Role-based access control restricts sensitive operations.
- Secrets and database credentials are stored in environment variables.

## 👨‍💻 Development

Built for the **Odoo Hackathon 2026** using React, FastAPI, and MongoDB.
