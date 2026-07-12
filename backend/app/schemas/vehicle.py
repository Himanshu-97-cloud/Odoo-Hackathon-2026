from enum import Enum

from pydantic import BaseModel, Field


class VehicleStatus(str, Enum):
    AVAILABLE = "available"
    ON_TRIP = "on-trip"
    IN_SHOP = "in-shop"
    RETIRED = "retired"


class VehicleCreate(BaseModel):
    registrationNumber: str = Field(..., min_length=5, max_length=15)
    nameModel: str = Field(..., min_length=1, max_length=80)
    vehicleType: str = Field(..., min_length=1, max_length=50)
    capacity: float = Field(..., gt=0)
    odometer: float = Field(..., ge=0)
    acquisitionCost: float = Field(..., gt=0)
    status: VehicleStatus = VehicleStatus.AVAILABLE


class VehicleUpdate(BaseModel):
    registrationNumber: str = Field(..., min_length=5, max_length=15)
    nameModel: str = Field(..., min_length=1, max_length=80)
    vehicleType: str = Field(..., min_length=1, max_length=50)
    capacity: float = Field(..., gt=0)
    odometer: float = Field(..., ge=0)
    acquisitionCost: float = Field(..., gt=0)
    status: VehicleStatus


class VehicleStatusUpdate(BaseModel):
    status: VehicleStatus