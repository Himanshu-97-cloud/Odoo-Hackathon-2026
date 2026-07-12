from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ServerSelectionTimeoutError
from typing import Optional
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "transitops")

# Global instances
client: Optional[MongoClient] = None
db: Optional[Database] = None


def get_db() -> Database:
    """
    Returns the MongoDB database instance.
    Creates the connection only once.
    """
    global client, db

    if db is None:
        try:
            client = MongoClient(
                MONGO_URI,
                serverSelectionTimeoutMS=5000
            )

            # Check if MongoDB is reachable
            client.admin.command("ping")

            db = client[DATABASE_NAME]

            print(f"[INFO] Connected to MongoDB ({DATABASE_NAME})")

        except ServerSelectionTimeoutError as e:
            print(f"[ERROR] Unable to connect to MongoDB: {e}")
            raise

    return db


def create_indexes():
    """
    Create all required indexes.
    Call this once when the application starts.
    """

    database = get_db()

    # Users
    database.users.create_index("email", unique=True)

    # Vehicles
    database.vehicles.create_index(
        "registration_number",
        unique=True
    )
    database.vehicles.create_index("status")

    # Drivers
    database.drivers.create_index(
        "license_number",
        unique=True
    )
    database.drivers.create_index("status")

    # Trips
    database.trips.create_index("status")
    database.trips.create_index("vehicle_id")
    database.trips.create_index("driver_id")

    # Maintenance
    database.maintenance_logs.create_index(
        [
            ("vehicle_id", 1),
            ("status", 1)
        ]
    )

    print("[INFO] Database indexes created.")


def ping_database() -> bool:
    """
    Returns True if MongoDB is running.
    """

    try:
        get_db().client.admin.command("ping")
        return True
    except Exception:
        return False


def close_db():
    """
    Close MongoDB connection.
    """

    global client

    if client:
        client.close()
        print("[INFO] MongoDB connection closed")