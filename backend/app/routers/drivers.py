from fastapi import APIRouter, Depends, status

from app.core.dependencies import (
    get_current_user,
    require_fleet_manager,
    require_safety_officer,
)
from app.schemas.driver import (
    DriverCreate,
    DriverResponse,
    DriverStatusUpdate,
    DriverUpdate,
)
from app.services.driver_service import (
    change_driver_status,
    create_driver,
    delete_driver,
    get_all_drivers,
    get_driver_by_id,
    restore_driver,
    suspend_driver,
    update_driver,
)


router = APIRouter(
    tags=["Drivers"],
)


@router.get(
    "",
    response_model=list[DriverResponse],
)
async def list_drivers(
    current_user: dict = Depends(
        get_current_user
    ),
):
    return get_all_drivers()


@router.get(
    "/{driver_id}",
    response_model=DriverResponse,
)
async def get_driver(
    driver_id: str,
    current_user: dict = Depends(
        get_current_user
    ),
):
    return get_driver_by_id(driver_id)


@router.post(
    "",
    response_model=DriverResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_driver(
    driver_data: DriverCreate,
    current_user: dict = Depends(
        require_fleet_manager
    ),
):
    return create_driver(driver_data)


@router.put(
    "/{driver_id}",
    response_model=DriverResponse,
)
async def edit_driver(
    driver_id: str,
    driver_data: DriverUpdate,
    current_user: dict = Depends(
        require_fleet_manager
    ),
):
    return update_driver(
        driver_id,
        driver_data,
    )


@router.patch(
    "/{driver_id}/status",
    response_model=DriverResponse,
)
async def update_status(
    driver_id: str,
    status_data: DriverStatusUpdate,
    current_user: dict = Depends(
        require_fleet_manager
    ),
):
    return change_driver_status(
        driver_id,
        status_data.status,
    )


@router.patch(
    "/{driver_id}/suspend",
    response_model=DriverResponse,
)
async def suspend(
    driver_id: str,
    current_user: dict = Depends(
        require_safety_officer
    ),
):
    return suspend_driver(driver_id)


@router.patch(
    "/{driver_id}/restore",
    response_model=DriverResponse,
)
async def restore(
    driver_id: str,
    current_user: dict = Depends(
        require_safety_officer
    ),
):
    return restore_driver(driver_id)


@router.delete(
    "/{driver_id}",
)
async def remove_driver(
    driver_id: str,
    current_user: dict = Depends(
        require_fleet_manager
    ),
):
    return delete_driver(driver_id)