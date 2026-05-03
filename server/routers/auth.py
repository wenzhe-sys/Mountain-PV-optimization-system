from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from schemas import UserSignup, UserLogin, TokenResponse, UserResponse
from services.auth_service import (
    get_user_by_email, create_user, verify_password, create_access_token, decode_token,
)
from models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="未提供认证令牌")
    try:
        payload = decode_token(credentials.credentials)
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="无效令牌")
    except Exception:
        raise HTTPException(status_code=401, detail="无效令牌")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user


@router.post("/signup", response_model=TokenResponse)
def signup(body: UserSignup, db: Session = Depends(get_db)):
    if get_user_by_email(db, body.email):
        raise HTTPException(status_code=400, detail="邮箱已注册")
    user = create_user(db, body.name, body.email, body.password, body.role)
    token = create_access_token({"user_id": user.id, "role": user.role})
    return TokenResponse(
        token=token,
        data={"user": UserResponse.model_validate(user).model_dump()},
    )


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    token = create_access_token({"user_id": user.id, "role": user.role})
    return TokenResponse(
        token=token,
        data={"user": UserResponse.model_validate(user).model_dump()},
    )


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "data": {"user": UserResponse.model_validate(current_user).model_dump()},
    }
