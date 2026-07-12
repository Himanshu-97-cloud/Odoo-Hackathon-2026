from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_db
from app.schemas.driver import (
    DriverCreate,
    DriverUpdate,
)


def get_drivers_collection():
    database = get_db()
    return database.drivers


def serialize_driver(driver: dict) -> dict:
    return {
        "id": str(driver["_id"]),
        "fullName": driver["fullName"],
        "licenseNumber": driver["licenseNumber"],
        "category": driver["category"],
        "licenseExpiry": driver["licenseExpiry"],
        "phone": driver["phone"],
        "safetyStatus": driver.get(
            "safetyStatus",
            "available",
        ),
        "status": driver.get(
            "status",
            "available",
        ),
        "completedTrips": driver.get(
            "completedTrips",
            0,
        ),
        "totalTrips": driver.get(
            "totalTrips",
            0,
        ),
    }


def parse_driver_id(driver_id: str) -> ObjectId:
    try:
        return ObjectId(driver_id)

    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid driver ID.",
        )


def find_driver_or_404(driver_id: str) -> dict:
    object_id = parse_driver_id(driver_id)

    driver = get_drivers_collection().find_one(
        {"_id": object_id}
    )

    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found.",
        )

    return driver


def get_all_drivers() -> list[dict]:
    drivers = get_drivers_collection().find().sort(
        "created_at",
        -1,
    )

    return [
        serialize_driver(driver)
        for driver in drivers
    ]


def get_driver_by_id(driver_id: str) -> dict:
    driver = find_driver_or_404(driver_id)

    return serialize_driver(driver)


def create_driver(
    driver_data: DriverCreate,
) -> dict:

    collection = get_drivers_collection()

    license_number = (
        driver_data.licenseNumber
        .strip()
        .upper()
        .replace(" ", "")
        .replace("-", "")
    )

    phone = driver_data.phone.strip()

    existing_license = collection.find_one(
        {"licenseNumber": license_number}
    )

    if existing_license:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A driver with this licence "
                "number already exists."
            ),
        )

    existing_phone = collection.find_one(
        {"phone": phone}
    )

    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A driver with this phone "
                "number already exists."
            ),
        )

    now = datetime.now(timezone.utc)

    document = {
        "fullName": driver_data.fullName.strip(),
        "licenseNumber": license_number,
        "category": driver_data.category,
        "licenseExpiry": driver_data.licenseExpiry,
        "phone": phone,
        "safetyStatus": driver_data.safetyStatus,
        "status": (
            "suspended"
            if driver_data.safetyStatus == "suspended"
            else driver_data.status
        ),
        "completedTrips": 0,
        "totalTrips": 0,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = collection.insert_one(document)

    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Driver licence or phone "
                "already exists."
            ),
        )

    created_driver = collection.find_one(
        {"_id": result.inserted_id}
    )

    return serialize_driver(created_driver)


def update_driver(
    driver_id: str,
    driver_data: DriverUpdate,
) -> dict:

    collection = get_drivers_collection()

    existing_driver = find_driver_or_404(
        driver_id
    )

    update_data = driver_data.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    if "fullName" in update_data:
        update_data["fullName"] = (
            update_data["fullName"].strip()
        )

    if "licenseNumber" in update_data:
        license_number = (
            update_data["licenseNumber"]
            .strip()
            .upper()
            .replace(" ", "")
            .replace("-", "")
        )

        duplicate = collection.find_one(
            {
                "licenseNumber": license_number,
                "_id": {
                    "$ne": existing_driver["_id"]
                },
            }
        )

        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A driver with this licence "
                    "number already exists."
                ),
            )

        update_data["licenseNumber"] = (
            license_number
        )

    if "phone" in update_data:
        phone = update_data["phone"].strip()

        duplicate = collection.find_one(
            {
                "phone": phone,
                "_id": {
                    "$ne": existing_driver["_id"]
                },
            }
        )

        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A driver with this phone "
                    "number already exists."
                ),
            )

        update_data["phone"] = phone

    if (
        update_data.get("safetyStatus")
        == "suspended"
    ):
        update_data["status"] = "suspended"

    update_data["updated_at"] = (
        datetime.now(timezone.utc)
    )

    collection.update_one(
        {"_id": existing_driver["_id"]},
        {"$set": update_data},
    )

    updated_driver = collection.find_one(
        {"_id": existing_driver["_id"]}
    )

    return serialize_driver(updated_driver)


def change_driver_status(
    driver_id: str,
    new_status: str,
) -> dict:

    collection = get_drivers_collection()

    driver = find_driver_or_404(driver_id)

    if (
        new_status == "available"
        and driver.get("safetyStatus")
        == "suspended"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Suspended driver cannot "
                "be marked available."
            ),
        )

    collection.update_one(
        {"_id": driver["_id"]},
        {
            "$set": {
                "status": new_status,
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    updated_driver = collection.find_one(
        {"_id": driver["_id"]}
    )

    return serialize_driver(updated_driver)


def suspend_driver(driver_id: str) -> dict:
    collection = get_drivers_collection()

    driver = find_driver_or_404(driver_id)

    collection.update_one(
        {"_id": driver["_id"]},
        {
            "$set": {
                "safetyStatus": "suspended",
                "status": "suspended",
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    updated_driver = collection.find_one(
        {"_id": driver["_id"]}
    )

    return serialize_driver(updated_driver)


def restore_driver(driver_id: str) -> dict:
    collection = get_drivers_collection()

    driver = find_driver_or_404(driver_id)

    expiry = driver.get("licenseExpiry")

    if expiry:
        try:
            expiry_date = datetime.strptime(
                expiry,
                "%Y-%m-%d",
            ).date()

            current_date = datetime.now(
                timezone.utc
            ).date()

            if expiry_date < current_date:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Cannot restore driver "
                        "because the licence has expired."
                    ),
                )

        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid licence expiry date.",
            )

    collection.update_one(
        {"_id": driver["_id"]},
        {
            "$set": {
                "safetyStatus": "available",
                "status": "available",
                "updated_at": datetime.now(
                    timezone.utc
                ),
            }
        },
    )

    updated_driver = collection.find_one(
        {"_id": driver["_id"]}
    )

    return serialize_driver(updated_driver)


def delete_driver(driver_id: str) -> dict:
    collection = get_drivers_collection()

    driver = find_driver_or_404(driver_id)

    collection.delete_one(
        {"_id": driver["_id"]}
    )

    return {
        "message": "Driver deleted successfully."
    }