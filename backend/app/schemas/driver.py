from typing import Literal

from pydantic import BaseModel, Field


DriverCategory = Literal["LMV", "HMV", "MCWG", "TRANS"]

DriverSafetyStatus = Literal[
    "available",
    "suspended",
]

DriverDutyStatus = Literal[
    "available",
    "on-trip",
    "off-duty",
    "suspended",
]


class DriverCreate(BaseModel):
    fullName: str = Field(
        ...,
        min_length=3,
        max_length=100,
    )

    licenseNumber: str = Field(
        ...,
        min_length=15,
        max_length=15,
    )

    category: DriverCategory

    licenseExpiry: str

    phone: str = Field(
        ...,
        min_length=10,
        max_length=10,
    )

    safetyStatus: DriverSafetyStatus = "available"

    status: DriverDutyStatus = "available"


class DriverUpdate(BaseModel):
    fullName: str | None = Field(
        default=None,
        min_length=3,
        max_length=100,
    )

    licenseNumber: str | None = Field(
        default=None,
        min_length=15,
        max_length=15,
    )

    category: DriverCategory | None = None

    licenseExpiry: str | None = None

    phone: str | None = Field(
        default=None,
        min_length=10,
        max_length=10,
    )

    safetyStatus: DriverSafetyStatus | None = None

    status: DriverDutyStatus | None = None


class DriverStatusUpdate(BaseModel):
    status: DriverDutyStatus


class DriverResponse(BaseModel):
    id: str
    fullName: str
    licenseNumber: str
    category: DriverCategory
    licenseExpiry: str
    phone: str
    safetyStatus: DriverSafetyStatus
    status: DriverDutyStatus
    completedTrips: int = 0
    totalTrips: int = 0