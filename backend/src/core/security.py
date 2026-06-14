"""
Security utilities and authentication dependencies.
Handles:
- Password hashing
- JWT creation and validation
- FastAPI dependency injection for authenticated users
- Support for both Authorization header and HTTP-only cookie
"""

import os
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session

from src.core.database import get_session
from src.models.user import User
from src.repositories.user_repo import UserRepository

load_dotenv()

# -------------------------
# CONFIG
# -------------------------

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required")

ALGORITHM = os.getenv("ALGORITHM")
if not ALGORITHM:
    raise ValueError("ALGORITHM environment variable is required")

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# -------------------------
# PASSWORD HASHING
# -------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


# -------------------------
# JWT SETUP
# -------------------------

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_jwt_token(user: User) -> str:
    """
    Create a JWT access token for a user with expiration.
    """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user.id),
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _decode_token(token: str) -> int:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise credentials_exception
        return int(user_id)
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")
    except JWTError:
        raise credentials_exception


def _get_token_from_request(request: Request) -> str:
    token = request.cookies.get("access_token")
    if token:
        return token

    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[len("Bearer ") :]

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )


def get_current_user_flexible(
    request: Request,
    session: Session = Depends(get_session),
) -> User:
    """
    Dependency to get the currently authenticated user.
    Supports both HTTP-only cookies and Bearer tokens.
    """
    token = _get_token_from_request(request)
    user_id = _decode_token(token)

    repo = UserRepository(session)
    user = repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
