import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.db.database import DatabaseManager
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["User Authentication"])
security_scheme = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    """
    FastAPI dependency to extract and validate the JWT Bearer token.
    Retrieves the authenticated user from the SQLite database.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = DatabaseManager.get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest):
    """
    Registers a new user account in SQLite.
    Enforces password matching, prevents duplicate emails, and hashes password with PBKDF2.
    """
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Check for duplicate email
    existing = DatabaseManager.get_user_by_email(request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An account with email '{request.email}' already exists. Please sign in."
        )

    user_id = f"u-{uuid.uuid4().hex[:12]}"
    hashed_pwd = hash_password(request.password)
    created_at = datetime.now(timezone.utc).isoformat()

    created_user = DatabaseManager.create_user(
        user_id=user_id,
        full_name=request.full_name,
        email=request.email,
        hashed_password=hashed_pwd,
        created_at=created_at
    )

    access_token = create_access_token({"sub": user_id, "email": created_user["email"]})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=created_user["id"],
            full_name=created_user["full_name"],
            email=created_user["email"],
            created_at=created_user["created_at"]
        )
    )

@router.post("/login", response_model=TokenResponse)
def login(request: UserLoginRequest):
    """
    Authenticates user credentials and issues a signed JWT access token.
    """
    user = DatabaseManager.get_user_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = create_access_token({"sub": user["id"], "email": user["email"]})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            full_name=user["full_name"],
            email=user["email"],
            created_at=user["created_at"]
        )
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Returns the profile of the currently authenticated user."""
    return UserResponse(
        id=current_user["id"],
        full_name=current_user["full_name"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )
