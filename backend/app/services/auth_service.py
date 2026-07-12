# app/services/auth_service.py
"""
Authentication service for TransitOps.

This file contains ONLY business logic related to authentication:
    - registering a user
    - logging a user in
    - looking up users (by email / by id)
    - updating last_login

It does NOT contain:
    - route decorators (@router.post) -> those live in routers/auth.py
    - JWT creation/decoding logic     -> that lives in core/security.py
    - Pydantic schemas                -> those live in schemas/auth.py
    - DB connection setup              -> that lives in db/mongodb.py
"""

from datetime import datetime
from typing import Optional
from jose import JWTError

from fastapi import HTTPException, status
from bson import ObjectId
from bson.errors import InvalidId

from app.db.mongodb import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.models.user import UserModel

# FIX (Issue 1): the schema file defines RegisterRequest / LoginRequest,
# not UserCreate / UserLogin. Import names must match the real classes.
# FIX (Issue 2): UserRole was imported but never used in this file, so
# it has been removed from the import list entirely.
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse

db = get_db()


# ====================== HELPER FUNCTIONS ======================

def get_user_by_email(email: str) -> Optional[dict]:
    """
    Find a user by email (normalized to lowercase).
    Centralized here so no other file has to repeat this query.
    """
    normalized_email = email.lower().strip()
    return db.users.find_one({"email": normalized_email})


def get_user_by_id(user_id: str) -> Optional[dict]:
    """
    Find a user by their MongoDB _id.

    FIX (Issue 3): catching both InvalidId and Exception was redundant,
    since Exception already covers InvalidId. We keep the more specific
    exception (InvalidId) since that's the only realistic failure here
    (a malformed id string that can't be converted to ObjectId).
    """
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        return None

    return db.users.find_one({"_id": object_id})


def convert_objectid_to_str(user_dict: dict) -> dict:    
    if not user_dict:
        return user_dict

    user_dict = user_dict.copy()

    if "_id" in user_dict:
        user_dict["_id"] = str(user_dict["_id"])

    return user_dict
def update_last_login(user_id) -> None:
    """
    Function 5: Update the user's last_login timestamp.

    Kept as its own function (instead of inlined into login_user)
    so all authentication-related DB writes are grouped together
    and easy to find/reuse later (e.g. for a "refresh token" flow).
    """
    db.users.update_one(
        {"_id": user_id},
        {"$set": {"last_login": datetime.utcnow()}}
    )


# ====================== MAIN SERVICES ======================

def register_user(user_data: RegisterRequest) -> dict:
    """
    Function 1: Register a new user.
    Called by POST /api/auth/register
    """
    email = user_data.email.lower().strip()

    # Step 1: reject duplicate emails
    if get_user_by_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Step 2: hash the password (never store it in plain text)
    hashed_password = hash_password(user_data.password)

    # Step 3: build the user document using the UserModel
    user_model = UserModel(
        name=user_data.name,
        email=email,
        hashed_password=hashed_password,
        role=user_data.role
    )

    # Step 4: insert into MongoDB
    user_dict = user_model.to_dict()
    result = db.users.insert_one(user_dict)

    # Step 5: fetch the created user back and clean it for the response
    created_user = db.users.find_one({"_id": result.inserted_id})
    created_user = convert_objectid_to_str(created_user)

    # FIX (Issue 5): the old .pop("hashed_password", None) call was
    # unnecessary since we build the response dict manually below and
    # never include hashed_password in it in the first place. Removed.

    return {
        "message": "User registered successfully",
        "user": {
            "id": created_user["_id"],
            "name": created_user["name"],
            "email": created_user["email"],
            "role": created_user["role"]
        }
    }


def login_user(login_data: LoginRequest) -> TokenResponse:
    """
    Function 2: Authenticate a user and return a JWT.
    Called by POST /api/auth/login
    """
    user = get_user_by_email(login_data.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    stored_hashed_password = user.get("hashed_password")
    if not stored_hashed_password or not verify_password(
        login_data.password, stored_hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is disabled"
        )

    # Step: update last_login (Function 5, called from here)
    update_last_login(user["_id"])

    # Step: create the JWT
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "email": user["email"],
            "role": user["role"]
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user["role"]
    )


def get_current_user_from_token(token: str) -> dict:
    """
    Used by protected routes (via a dependency in core/dependencies.py)
    to resolve "which user is making this request" from their JWT.

    FIX (Issue 6): previously this raised a plain ValueError just to
    immediately catch it as Exception below - that's raising an error
    only to catch it a few lines later, which is redundant. Now we
    raise the HTTPException directly when the payload has no "sub",
    and only wrap the actual decode step in try/except.
    """
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user = convert_objectid_to_str(user)
    user.pop("hashed_password", None)  # never leak the hash to the caller

    return user