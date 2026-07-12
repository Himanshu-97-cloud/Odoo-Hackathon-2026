# app/core/dependencies.py
"""
Reusable FastAPI dependencies for TransitOps.

Think of this file as the "security gate" every protected request
passes through before it reaches a route's actual logic:

    Request -> get_current_user -> (optional) role check -> Route
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.services.auth_service import get_current_user_from_token
from app.schemas.auth import UserRole

# -------------------------------------------------------------
# TOKEN EXTRACTION
# -------------------------------------------------------------
# OAuth2PasswordBearer tells FastAPI "expect a Bearer token in the
# Authorization header". tokenUrl is only used to point Swagger's
# 'Authorize' button at our login route - it doesn't change behavior.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# -------------------------------------------------------------
# STEP 1-4: GET THE CURRENT AUTHENTICATED USER
# -------------------------------------------------------------
async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    The core authentication dependency.

    FastAPI automatically:
      1. Reads the "Authorization: Bearer <token>" header
      2. Extracts just the <token> part and passes it in here

    We then hand that raw token straight to the auth service, which
    already knows how to:
      - decode the JWT (core/security.py)
      - reject invalid/expired/malformed tokens
      - look up the user by the "sub" claim
      - reject the request if that user no longer exists
      - return a clean dict (with _id already converted to a string
        and hashed_password already stripped out)

    We deliberately do NOT reimplement any of that logic here -
    we just delegate to the service that already owns it.
    """
    # This single call covers steps 2 and 3 from the spec:
    # decode the JWT, then resolve it to a real user document.
    # get_current_user_from_token() already raises the correct
    # HTTPException (401) if the token is bad or the user is gone.
    current_user = get_current_user_from_token(token)
    return current_user


# -------------------------------------------------------------
# ROLE-BASED ACCESS CONTROL (RBAC)
# -------------------------------------------------------------
# Instead of writing "if role != X: raise 403" inside every route,
# we build ONE reusable factory function that generates a dependency
# for any role (or set of roles) we need to protect a route with.
def require_role(*allowed_roles: UserRole):
    """
    Dependency FACTORY - a function that returns a dependency.

    Usage in a router:

        @router.post("/vehicles", dependencies=[Depends(require_role(UserRole.FLEET_MANAGER))])
        async def create_vehicle(...):
            ...

    This keeps every route's role requirement declared in one line,
    right next to the route itself, instead of duplicated checks
    scattered across every function body.
    """

    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role")

        if user_role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of these roles: "
                       f"{', '.join(role.value for role in allowed_roles)}"
            )

        return current_user

    return role_checker


# -------------------------------------------------------------
# CONVENIENCE SHORTCUTS FOR EACH ROLE
# -------------------------------------------------------------
# These are just pre-built calls to require_role(), so routers can
# import a ready-to-use name instead of typing require_role(...)
# with the exact enum every time.

require_fleet_manager = require_role(UserRole.FLEET_MANAGER)
require_driver = require_role(UserRole.DRIVER)
require_safety_officer = require_role(UserRole.SAFETY_OFFICER)
require_financial_analyst = require_role(UserRole.FINANCIAL_ANALYST)