from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.db.mongodb import get_db
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleStatusUpdate,
)


def serialize_vehicle(vehicle: dict) -> dict:
    return {
        "id": str(vehicle["_id"]),
        "registrationNumber": vehicle["registrationNumber"],
        "nameModel": vehicle["nameModel"],
        "vehicleType": vehicle["vehicleType"],
        "capacity": vehicle["capacity"],
        "odometer": vehicle["odometer"],
        "acquisitionCost": vehicle["acquisitionCost"],
        "status": vehicle["status"],
        "createdAt": vehicle.get("createdAt"),
        "updatedAt": vehicle.get("updatedAt"),
    }


def get_vehicle_object_id(vehicle_id: str) -> ObjectId:
    try:
        return ObjectId(vehicle_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vehicle ID.",
        )


def get_all_vehicles() -> list[dict]:
    db = get_db()

    vehicles = db.vehicles.find().sort("createdAt", -1)

    return [
        serialize_vehicle(vehicle)
        for vehicle in vehicles
    ]


def get_vehicle_by_id(vehicle_id: str) -> dict:
    db = get_db()

    object_id = get_vehicle_object_id(vehicle_id)

    vehicle = db.vehicles.find_one({"_id": object_id})

    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found.",
        )

    return serialize_vehicle(vehicle)


def create_vehicle(vehicle_data: VehicleCreate) -> dict:
    db = get_db()

    registration_number = (
        vehicle_data.registrationNumber
        .strip()
        .upper()
        .replace(" ", "")
        .replace("-", "")
    )

    existing_vehicle = db.vehicles.find_one(
        {"registrationNumber": registration_number}
    )

    if existing_vehicle:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vehicle with this registration number already exists.",
        )

    now = datetime.now(timezone.utc)

    vehicle = {
        "registrationNumber": registration_number,
        "nameModel": vehicle_data.nameModel.strip(),
        "vehicleType": vehicle_data.vehicleType.strip(),
        "capacity": vehicle_data.capacity,
        "odometer": vehicle_data.odometer,
        "acquisitionCost": vehicle_data.acquisitionCost,
        "status": vehicle_data.status.value,
        "createdAt": now,
        "updatedAt": now,
    }

    try:
        result = db.vehicles.insert_one(vehicle)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vehicle with this registration number already exists.",
        )

    created_vehicle = db.vehicles.find_one(
        {"_id": result.inserted_id}
    )

    return serialize_vehicle(created_vehicle)


def update_vehicle(
    vehicle_id: str,
    vehicle_data: VehicleUpdate,
) -> dict:
    db = get_db()

    object_id = get_vehicle_object_id(vehicle_id)

    existing_vehicle = db.vehicles.find_one(
        {"_id": object_id}
    )

    if not existing_vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found.",
        )

    registration_number = (
        vehicle_data.registrationNumber
        .strip()
        .upper()
        .replace(" ", "")
        .replace("-", "")
    )

    duplicate = db.vehicles.find_one(
        {
            "registrationNumber": registration_number,
            "_id": {"$ne": object_id},
        }
    )

    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vehicle with this registration number already exists.",
        )

    update_data = {
        "registrationNumber": registration_number,
        "nameModel": vehicle_data.nameModel.strip(),
        "vehicleType": vehicle_data.vehicleType.strip(),
        "capacity": vehicle_data.capacity,
        "odometer": vehicle_data.odometer,
        "acquisitionCost": vehicle_data.acquisitionCost,
        "status": vehicle_data.status.value,
        "updatedAt": datetime.now(timezone.utc),
    }

    try:
        db.vehicles.update_one(
            {"_id": object_id},
            {"$set": update_data},
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vehicle with this registration number already exists.",
        )

    updated_vehicle = db.vehicles.find_one(
        {"_id": object_id}
    )

    return serialize_vehicle(updated_vehicle)


def update_vehicle_status(
    vehicle_id: str,
    status_data: VehicleStatusUpdate,
) -> dict:
    db = get_db()

    object_id = get_vehicle_object_id(vehicle_id)

    result = db.vehicles.update_one(
        {"_id": object_id},
        {
            "$set": {
                "status": status_data.status.value,
                "updatedAt": datetime.now(timezone.utc),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found.",
        )

    updated_vehicle = db.vehicles.find_one(
        {"_id": object_id}
    )

    return serialize_vehicle(updated_vehicle)


def delete_vehicle(vehicle_id: str) -> dict:
    db = get_db()

    object_id = get_vehicle_object_id(vehicle_id)

    result = db.vehicles.delete_one(
        {"_id": object_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found.",
        )

    return {
        "message": "Vehicle deleted successfully."
    }