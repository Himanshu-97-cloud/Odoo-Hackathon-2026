from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.auth import UserRole


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserModel(BaseModel):
    """
    Represents a user document stored in MongoDB.
    """

    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    hashed_password: str

    role: UserRole

    is_active: bool = True

    created_at: datetime = Field(
        default_factory=utc_now
    )

    updated_at: datetime = Field(
        default_factory=utc_now
    )

    last_login: Optional[datetime] = None

    model_config = ConfigDict(
        use_enum_values=True,
    )

    def to_dict(self) -> dict:
        return self.model_dump()