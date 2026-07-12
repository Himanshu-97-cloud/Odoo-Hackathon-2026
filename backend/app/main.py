from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.mongodb import (
    get_db,
    create_indexes,
    close_db
)



# Application Startup / Shutdown

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



# FastAPI App

app = FastAPI(
    title="TransitOps API",
    description="Smart Transport Operations Platform",
    version="1.0.0",
    lifespan=lifespan
)



# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Root Endpoint

@app.get("/")
def root():
    return {
        "message": "Welcome to TransitOps API",
        "status": "running",
        "docs": "/docs"
    }



# Health Check

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }



# Routers

@app.get("/collections")
def collections():
    database = get_db()
    return database.list_collection_names()