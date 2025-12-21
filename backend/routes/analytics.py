from fastapi import APIRouter, Depends
from routes.auth import get_user_from_token
from database import get_database
from services.fraud_detector import fraud_detector
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
async def get_dashboard(user = Depends(get_user_from_token)):
    """Ana dashboard istatistikleri"""
    db = await get_database()
    
    stats = await fraud_detector.get_dashboard_stats(db, user['id'])
    
    return stats

@router.get("/blocked-ips")
async def get_my_blocked_ips(user = Depends(get_user_from_token)):
    """Kullanıcının havuzlarında engellenen tüm IP'ler"""
    db = await get_database()
    
    from services.pool_service import pool_service
    user_pools = await pool_service.get_user_pools(db, user['id'])
    
    if not user_pools:
        return []
    
    blocked_ips = await db.blocked_ips.find(
        {"pool_codes": {"$in": user_pools}},
        {"_id": 0}
    ).sort("blocked_at", -1).limit(100).to_list(None)
    
    return blocked_ips

@router.get("/recent-threats")
async def get_recent_threats(limit: int = 20, user = Depends(get_user_from_token)):
    """Son şüpheli tıklamalar"""
    db = await get_database()
    
    threats = await db.clicks.find(
        {"user_id": user['id'], "is_suspicious": True},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(None)
    
    return threats
