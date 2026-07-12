# app/main.py
"""
Application entrypoint for TransitOps.

This file is responsible for:
    - creating the FastAPI app
    - wiring up startup/shutdown (lifespan)
    - enabling CORS
    - registering every router

It should NOT contain business logic, database queries, or
authentication logic - those all live in their own layers
(services/, db/, core/).
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.mongodb import (
    get_db,
    create_indexes,
    close_db
)

# The router built in app/routers/auth.py
from app.routers import auth


# -------------------------------------------------------------
# Application Startup / Shutdown
# -------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[INFO] Starting TransitOps Backend...")

    # Connect MongoDB
    get_db()

    # Create indexes
    create_indexes()

    yield

    # Close MongoDB
    close_db()

    print("[INFO] TransitOps Backend Stopped.")


# -------------------------------------------------------------
# FastAPI App
# -------------------------------------------------------------
app = FastAPI(
    title="TransitOps API",
    description="Smart Transport Operations Platform",
    version="1.0.0",
    lifespan=lifespan
)


# -------------------------------------------------------------
# CORS
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------
# Root Endpoint
# -------------------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "Welcome to TransitOps API",
        "status": "running",
        "docs": "/docs"
    }


# -------------------------------------------------------------
# Health Check
# -------------------------------------------------------------
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# -------------------------------------------------------------
# Routers
# -------------------------------------------------------------
# Every router built so far gets registered here, with a prefix
# that matches what dependencies.py and the frontend expect
# (e.g. /api/auth/login, /api/auth/me).
#
# As new modules (vehicles, drivers, trips, maintenance, fuel,
# expenses, dashboard) are built, they get one line each, right
# here - nowhere else.

app.include_router(
    auth.router,
    prefix="/api/auth"
)

# Future routers will be added the same way, e.g.:
# app.include_router(vehicles.router, prefix="/api/vehicles")
# app.include_router(drivers.router, prefix="/api/drivers")
# app.include_router(trips.router, prefix="/api/trips")
# app.include_router(maintenance.router, prefix="/api/maintenance")
# app.include_router(fuel.router, prefix="/api/fuel")
# app.include_router(expenses.router, prefix="/api/expenses")
# app.include_router(dashboard.router, prefix="/api/dashboard")