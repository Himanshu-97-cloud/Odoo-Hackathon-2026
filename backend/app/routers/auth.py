# app/routers/auth.py

from fastapi import APIRouter, Depends, status

from app.services.auth_service import register_user, login_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
async def register(user_data: RegisterRequest) -> dict:
    """Register a new user"""
    return register_user(user_data)


@router.post(
    "/login",
    response_model=TokenResponse
)
async def login(login_data: LoginRequest) -> TokenResponse:
    """Login and receive JWT token"""
    return login_user(login_data)


@router.get(
    "/me",
    response_model=UserResponse
)
async def get_current_user_info(current_user: dict = Depends(get_current_user)) -> UserResponse:
    """Get information of currently logged in user"""
 
    return {
        "id": current_user.get("_id"),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "role": current_user.get("role")
    }