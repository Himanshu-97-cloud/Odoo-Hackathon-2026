# app/models/user.py
"""
User model for the TransitOps application.

This model represents how a user is stored in the MongoDB
'users' collection.

NOTE:
- This file only defines the database model.
- Password hashing, login, JWT generation, and authentication
  logic belong in the authentication service.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Reuse the role enum from auth schema
from app.schemas.auth import UserRole


class UserModel(BaseModel):
    """
    Represents a user document stored in MongoDB.
    """

    # MongoDB automatically creates _id
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    hashed_password: str
    role: UserRole

    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    is_active: bool = True

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Alex Carter",
                "email": "alex@transitops.com",
                "hashed_password": "$2b$12$examplehashedpassword",
                "role": "Fleet Manager",
                "created_at": "2026-07-12T10:00:00",
                "last_login": None,
                "is_active": True
            }
        }
    )

    def to_dict(self) -> dict:
        """
        Convert the Pydantic model into a dictionary
        before inserting into MongoDB.
        """
        return self.model_dump()