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
    membership_price: float = 99.0  # Aylık üyelik ücreti (TL)
    
class PoolMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    pool_code: str
    user_id: str
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    
    # YENİ: Engelleme ayarları
    click_threshold: int = 1  # Kaç tıklamadan sonra engelle (1, 2, 3)
    block_duration_days: int = 7  # Kaç gün engellensin (1-30)
    auto_renew: bool = True  # Otomatik yenileme

class PoolMemberCreate(BaseModel):
    pool_code: str
    user_id: str
    # YENİ: Kullanıcı ayarları
    click_threshold: int = 1
    block_duration_days: int = 7

class PoolMemberSettings(BaseModel):
    click_threshold: int = Field(ge=1, le=10)  # 1-10 arası
    block_duration_days: int = Field(ge=1, le=30)  # 1-30 gün arası

class PoolStats(BaseModel):
    pool_code: str
    sector_name: Optional[str]
    member_count: int
    total_blocked_ips: int
    recent_threats: int  # Last 24h
    membership_price: float

class OperatorCreatePool(BaseModel):
    """Operatör için havuz oluşturma - şehir ve sektör seçimi"""
    city_plate_code: str  # "34", "06", vb.
    sector_name: str  # "Tesisatçı", "Avukat", vb.
    membership_price: float = 99.0
    
class OperatorPoolUpdate(BaseModel):
    """Operatör için havuz güncelleme"""
    sector_name: Optional[str] = None
    membership_price: Optional[float] = None
    is_active: Optional[bool] = None
