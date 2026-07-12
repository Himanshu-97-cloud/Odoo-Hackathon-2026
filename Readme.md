# TransitOps

TransitOps is a full-stack fleet and transport operations management platform designed to help organizations manage vehicles, drivers, trips, maintenance, fuel expenses, and operational analytics from a single dashboard.

The platform provides secure role-based authentication, real-time operational visibility, and centralized fleet management through a modern and responsive web interface.

## Features

- Secure user registration and login
- JWT-based authentication
- Role-based access control
- Fleet dashboard with operational statistics
- Vehicle management
- Driver management
- Trip management
- Maintenance tracking
- Fuel and expense management
- Analytics and reporting
- Dark and light mode
- Responsive user interface

## User Roles

TransitOps supports four different user roles:

- **Fleet Manager** — Manages vehicles, drivers, trips, and overall fleet operations.
- **Dispatcher** — Handles trip assignments and day-to-day transport operations.
- **Safety Officer** — Monitors driver and vehicle safety, compliance, and maintenance.
- **Financial Analyst** — Tracks fuel costs, expenses, and financial analytics.

## Tech Stack

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
- Uvicorn
- Pydantic
- JWT Authentication
- bcrypt password hashing

### Database

- MongoDB
- PyMongo
- MongoDB Atlas

## Project Structure

```text
Odoo-Hackathon-2026/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Vehicles.jsx
│   │   │   ├── Drivers.jsx
│   │   │   ├── Trips.jsx
│   │   │   ├── Maintenance.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── dependencies.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   └── mongodb.py
│   │   │
│   │   ├── models/
│   │   │   └── user.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── vehicles.py
│   │   │   └── drivers.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── vehicle.py
│   │   │   └── driver.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── vehicle_service.py
│   │   │   └── driver_service.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── .gitignore
└── README.md
```

## Authentication Flow

TransitOps uses JWT-based authentication.

1. A user registers with their name, email, password, and role.
2. The password is securely hashed before being stored in MongoDB.
3. The user logs in using their email and password.
4. The backend validates the credentials and returns a JWT access token.
5. The frontend stores the token and sends it with protected API requests.
6. The backend validates the token and identifies the authenticated user.
7. Role-based permissions determine which operations the user can perform.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Get current authenticated user |

### Vehicles

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/vehicles` | Get all vehicles |
| POST | `/api/vehicles` | Add a new vehicle |
| GET | `/api/vehicles/{vehicle_id}` | Get a specific vehicle |
| PUT | `/api/vehicles/{vehicle_id}` | Update a vehicle |
| DELETE | `/api/vehicles/{vehicle_id}` | Delete a vehicle |

### Drivers

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/drivers` | Get all drivers |
| POST | `/api/drivers` | Add a new driver |
| GET | `/api/drivers/{driver_id}` | Get a specific driver |
| PUT | `/api/drivers/{driver_id}` | Update a driver |
| DELETE | `/api/drivers/{driver_id}` | Delete a driver |

## Local Development Setup

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

The frontend will normally run at:

```text
http://localhost:5173
```

### 3. Set up the backend

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

### 4. Configure environment variables

Create a `.env` file inside the `backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
DATABASE_NAME=transitops
SECRET_KEY=your_secure_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Never commit the `.env` file or expose database credentials and secret keys publicly.

### 5. Start the backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The backend API will run at:

```text
http://127.0.0.1:8000
```

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Database Collections

TransitOps uses MongoDB with collections such as:

```text
users
vehicles
drivers
trips
maintenance_logs
fuel_logs
expenses
```

## Security

- Passwords are never stored as plain text.
- Passwords are securely hashed using bcrypt.
- Protected API routes require a valid JWT Bearer token.
- Role-based access control restricts sensitive operations.
- Environment variables are used for database credentials and application secrets.

## Current Development Status

Currently implemented:

- Frontend UI
- Responsive sidebar and header
- Dark and light theme
- Login and registration pages
- FastAPI backend architecture
- MongoDB Atlas connection
- User registration
- User login
- JWT token generation
- Current-user authentication endpoint
- Role-based access control foundation
- Vehicle backend API
- Driver backend API

Modules under continued development:

- Complete trip management backend
- Maintenance backend integration
- Fuel and expense backend integration
- Dashboard statistics from live database data
- Analytics and reporting
- Complete role-specific frontend permissions
- Deployment and production configuration

## Future Improvements

- Real-time vehicle tracking
- GPS and maps integration
- Automated maintenance reminders
- Driver performance scoring
- Advanced financial reports
- Real-time notifications
- Exportable PDF and CSV reports
- Refresh token authentication
- Automated testing
- Docker deployment

## Team

Developed for the **Odoo Hackathon 2026**.

## License

This project is intended for educational and hackathon purposes.