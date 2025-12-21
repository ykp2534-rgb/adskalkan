from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "user"  # user, operator, admin

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pools_joined: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    email: str
    full_name: str
    role: str
    pools_joined: List[str]
    created_at: datetime
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
