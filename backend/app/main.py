from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.mongodb import (
    close_database,
    connect_to_database,
    create_indexes,
    ping_database,
)
from app.routers import auth, vehicles, drivers

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle application startup and shutdown.
    """
    print("[INFO] Starting TransitOps Backend...")

    connect_to_database()
    create_indexes()

    yield

    close_database()

    print("[INFO] TransitOps Backend Stopped.")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Backend API for the TransitOps "
        "Smart Transport Operations Platform"
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/",
    tags=["System"],
)
async def root():
    return {
        "message": "Welcome to TransitOps API",
        "status": "running",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get(
    "/health",
    tags=["System"],
)
async def health():
    database_connected = ping_database()

    return {
        "status": (
            "healthy"
            if database_connected
            else "unhealthy"
        ),
        "database": (
            "connected"
            if database_connected
            else "disconnected"
        ),
    }


app.include_router(
    auth.router,
    prefix="/api/auth",
)

app.include_router(
    vehicles.router,
    prefix="/api/vehicles",
)

app.include_router(
    drivers.router,
    prefix="/api/drivers",
)