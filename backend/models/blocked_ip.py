from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone

class BlockedIPBase(BaseModel):
    ip_address: str
    reason: str

class BlockedIPCreate(BlockedIPBase):
    pool_codes: List[str] = Field(default_factory=list)
    blocked_by_user_id: str
    is_global: bool = False

class BlockedIP(BlockedIPBase):
    model_config = ConfigDict(extra="ignore")
    
    pool_codes: List[str] = Field(default_factory=list)
    blocked_by_user_id: str
    blocked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_global: bool = False  # True = tüm havuzlar için engellenmiş
    detection_count: int = 1  # Kaç kez tespit edildi
