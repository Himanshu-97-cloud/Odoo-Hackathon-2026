from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleStatusUpdate,
)
from app.services.vehicle_service import (
    create_vehicle,
    delete_vehicle,
    get_all_vehicles,
    get_vehicle_by_id,
    update_vehicle,
    update_vehicle_status,
)


router = APIRouter(
    tags=["Vehicles"],
    dependencies=[Depends(get_current_user)],
)


@router.get("")
async def list_vehicles():
    return get_all_vehicles()


@router.get("/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    return get_vehicle_by_id(vehicle_id)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def add_vehicle(vehicle_data: VehicleCreate):
    return create_vehicle(vehicle_data)


@router.put("/{vehicle_id}")
async def edit_vehicle(
    vehicle_id: str,
    vehicle_data: VehicleUpdate,
):
    return update_vehicle(vehicle_id, vehicle_data)


@router.patch("/{vehicle_id}/status")
async def change_vehicle_status(
    vehicle_id: str,
    status_data: VehicleStatusUpdate,
):
    return update_vehicle_status(
        vehicle_id,
        status_data,
    )


@router.delete("/{vehicle_id}")
async def remove_vehicle(vehicle_id: str):
    return delete_vehicle(vehicle_id)