from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone

class PoolBase(BaseModel):
    pool_code: str  # Format: "34001" (Istanbul-34 + Sector-001)
    city_plate_code: str  # "34"
    sector_code: str  # "001"
    sector_name: Optional[str] = None  # Operator tarafından atanır

class PoolCreate(PoolBase):
    pass

class Pool(PoolBase):
    model_config = ConfigDict(extra="ignore")
    
    member_count: int = 0
    total_blocked_ips: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_premium: bool = True  # Havuz sistemi premium özellik
    
class PoolMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    pool_code: str
    user_id: str
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class PoolMemberCreate(BaseModel):
    pool_code: str
    user_id: str

class PoolStats(BaseModel):
    pool_code: str
    sector_name: Optional[str]
    member_count: int
    total_blocked_ips: int
    recent_threats: int  # Last 24h
