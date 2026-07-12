from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    """
    Available roles in TransitOps.
    """

    FLEET_MANAGER = "Fleet Manager"
    DRIVER = "Driver"
    SAFETY_OFFICER = "Safety Officer"
    FINANCIAL_ANALYST = "Financial Analyst"


class RegisterRequest(BaseModel):
    """
    Data required to register a new user.
    """

    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole


class LoginRequest(BaseModel):
    """
    Data required for user login.
    """

    email: EmailStr
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    """
    Response returned after successful login.
    """

    access_token: str
    token_type: str = "bearer"
    role: UserRole


class UserResponse(BaseModel):
    """
    User information returned to the frontend.
    """

    id: str
    name: str
    email: EmailStr
    role: UserRole