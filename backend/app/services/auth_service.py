from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from jose import JWTError
from pymongo.errors import DuplicateKeyError

from app.core.security import (
    create_access_token,
    decode_access_token,
    get_token_expiry_seconds,
    hash_password,
    verify_password,
)
from app.db.mongodb import get_db
from app.models.user import UserModel
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def get_user_by_email(email: str) -> Optional[dict]:
    """
    Find a user by normalized email address.
    """
    database = get_db()

    normalized_email = email.strip().lower()

    return database.users.find_one(
        {"email": normalized_email}
    )


def get_user_by_id(user_id: str) -> Optional[dict]:
    """
    Find a user by MongoDB ObjectId.
    """
    database = get_db()

    try:
        object_id = ObjectId(user_id)

    except (InvalidId, TypeError):
        return None

    return database.users.find_one(
        {"_id": object_id}
    )


def serialize_user(user: dict) -> dict:
    """
    Convert a MongoDB user document into safe API data.

    The password hash is deliberately never included.
    """
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "is_active": user.get("is_active", True),
    }


def register_user(
    user_data: RegisterRequest,
) -> RegisterResponse:
    """
    Register a new TransitOps user.
    """
    database = get_db()

    normalized_email = (
        str(user_data.email)
        .strip()
        .lower()
    )

    if get_user_by_email(normalized_email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user_model = UserModel(
        name=user_data.name,
        email=normalized_email,
        hashed_password=hash_password(
            user_data.password
        ),
        role=user_data.role,
    )

    user_document = user_model.to_dict()

    try:
        result = database.users.insert_one(
            user_document
        )

    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    created_user = database.users.find_one(
        {"_id": result.inserted_id}
    )

    if not created_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account was created but could not be retrieved.",
        )

    safe_user = serialize_user(created_user)

    return RegisterResponse(
        message="Account created successfully.",
        user=safe_user,
    )


def login_user(
    login_data: LoginRequest,
) -> TokenResponse:
    """
    Authenticate a user and issue a JWT access token.
    """
    database = get_db()

    user = get_user_by_email(
        str(login_data.email)
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    hashed_password = user.get(
        "hashed_password"
    )

    if (
        not hashed_password
        or not verify_password(
            login_data.password,
            hashed_password,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled.",
        )

    database.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "last_login": utc_now(),
                "updated_at": utc_now(),
            }
        },
    )

    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "email": user["email"],
            "role": user["role"],
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=get_token_expiry_seconds(),
        user=serialize_user(user),
    )


def get_current_user_from_token(
    token: str,
) -> dict:
    """
    Decode a JWT and resolve it to an active user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:
        payload = decode_access_token(token)

        user_id = payload.get("sub")

        if not user_id:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = get_user_by_id(user_id)

    if not user:
        raise credentials_exception

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled.",
        )

    return serialize_user(user)