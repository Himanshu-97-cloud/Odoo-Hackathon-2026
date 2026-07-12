from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.schemas.auth import UserRole
from app.services.auth_service import (
    get_current_user_from_token,
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> dict:
    """
    Return the authenticated user represented by the
    Bearer JWT sent with the request.
    """
    return get_current_user_from_token(token)


def require_role(
    *allowed_roles: UserRole,
) -> Callable:
    """
    Create a reusable FastAPI dependency that permits
    only users with one of the specified roles.
    """

    async def role_checker(
        current_user: dict = Depends(
            get_current_user
        ),
    ) -> dict:
        allowed_values = {
            role.value
            for role in allowed_roles
        }

        if current_user.get("role") not in allowed_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission "
                    "to perform this action."
                ),
            )

        return current_user

    return role_checker


require_fleet_manager = require_role(
    UserRole.FLEET_MANAGER
)

require_dispatcher = require_role(
    UserRole.DISPATCHER
)

require_safety_officer = require_role(
    UserRole.SAFETY_OFFICER
)

require_financial_analyst = require_role(
    UserRole.FINANCIAL_ANALYST
)