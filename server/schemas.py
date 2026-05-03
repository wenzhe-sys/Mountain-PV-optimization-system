from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# Auth schemas
class UserSignup(BaseModel):
    name: str
    email: str
    password: str
    role: str = "user"


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    status: str = "success"
    token: str
    data: dict


# Instance schemas
class InstanceResponse(BaseModel):
    id: int
    name: str
    instance_id: str
    n_nodes: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# Job schemas
class JobStatusResponse(BaseModel):
    id: int
    status: str
    progress: float
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
