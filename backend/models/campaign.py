from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid

class CampaignBase(BaseModel):
    name: str
    google_ads_id: Optional[str] = None  # Mock for now

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    status: str = "active"  # active, paused, deleted
    total_clicks: int = 0
    suspicious_clicks_count: int = 0
    blocked_clicks_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CampaignStats(BaseModel):
    total_clicks: int
    suspicious_clicks: int
    blocked_clicks: int
    clean_clicks: int
    fraud_percentage: float
    total_saved: float  # Estimated money saved
