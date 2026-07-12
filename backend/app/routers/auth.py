from fastapi import (
    APIRouter,
    Depends,
    status,
)

from app.core.dependencies import get_current_user
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import (
    login_user,
    register_user,
)


router = APIRouter(
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    user_data: RegisterRequest,
) -> RegisterResponse:
    """
    Create a new TransitOps account.
    """
    return register_user(user_data)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
async def login(
    login_data: LoginRequest,
) -> TokenResponse:
    """
    Authenticate a user and return a JWT.
    """
    return login_user(login_data)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
async def get_me(
    current_user: dict = Depends(
        get_current_user
    ),
) -> UserResponse:
    """
    Return the currently authenticated user.
    """
    return UserResponse(
        **current_user
    )