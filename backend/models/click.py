from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid

class ClickBase(BaseModel):
    campaign_id: str
    ip_address: str
    device_type: str  # desktop, mobile, tablet
    user_agent: Optional[str] = None
    referer: Optional[str] = None
    location_city: Optional[str] = None
    location_country: str = "TR"

class ClickCreate(ClickBase):
    user_id: str

class Click(ClickBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    device_fingerprint: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_suspicious: bool = False
    is_blocked: bool = False
    fraud_score: int = 0  # 0-100
    fraud_reasons: list = Field(default_factory=list)
    
class ClickAnalytics(BaseModel):
    total_clicks: int
    suspicious_clicks: int
    blocked_clicks: int
    clicks_by_device: Dict[str, int]
    clicks_by_city: Dict[str, int]
    fraud_score_avg: float
