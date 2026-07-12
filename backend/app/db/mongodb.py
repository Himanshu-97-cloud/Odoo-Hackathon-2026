from typing import Optional

from pymongo import ASCENDING, MongoClient
from pymongo.database import Database
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

from app.core.config import settings


client: Optional[MongoClient] = None
db: Optional[Database] = None


def connect_to_database() -> Database:
    """
    Create and verify the MongoDB connection.

    The connection is created only once and reused throughout
    the application.
    """
    global client, db

    if db is not None:
        return db

    try:
        client = MongoClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=5000,
        )

        client.admin.command("ping")

        db = client[settings.DATABASE_NAME]

        print(
            f"[INFO] Connected to MongoDB database: "
            f"{settings.DATABASE_NAME}"
        )

        return db

    except ServerSelectionTimeoutError as error:
        print(f"[ERROR] MongoDB connection failed: {error}")
        raise RuntimeError(
            "Could not connect to MongoDB. "
            "Check MONGO_URI and make sure MongoDB is running."
        ) from error


def get_db() -> Database:
    """
    Return the active MongoDB database connection.
    """
    if db is None:
        return connect_to_database()

    return db


def create_indexes() -> None:
    """
    Create database indexes required by TransitOps.
    """
    database = get_db()

    try:
        database.users.create_index(
            [("email", ASCENDING)],
            unique=True,
            name="unique_user_email",
        )

        database.vehicles.create_index(
            [("registration_number", ASCENDING)],
            unique=True,
            name="unique_vehicle_registration",
        )

        database.vehicles.create_index(
            [("status", ASCENDING)],
            name="vehicle_status",
        )

        database.drivers.create_index(
            [("license_number", ASCENDING)],
            unique=True,
            name="unique_driver_license",
        )

        database.drivers.create_index(
            [("status", ASCENDING)],
            name="driver_status",
        )

        database.trips.create_index(
            [("status", ASCENDING)],
            name="trip_status",
        )

        database.trips.create_index(
            [("vehicle_id", ASCENDING)],
            name="trip_vehicle",
        )

        database.trips.create_index(
            [("driver_id", ASCENDING)],
            name="trip_driver",
        )

        database.maintenance_logs.create_index(
            [
                ("vehicle_id", ASCENDING),
                ("status", ASCENDING),
            ],
            name="maintenance_vehicle_status",
        )

        print("[INFO] MongoDB indexes created successfully.")

    except PyMongoError as error:
        print(f"[ERROR] Failed to create MongoDB indexes: {error}")
        raise


def ping_database() -> bool:
    """
    Return True when MongoDB is reachable.
    """
    try:
        database = get_db()
        database.client.admin.command("ping")
        return True

    except Exception:
        return False


def close_database() -> None:
    """
    Close the MongoDB client connection.
    """
    global client, db

    if client is not None:
        client.close()

    client = None
    db = None

    print("[INFO] MongoDB connection closed.")