from fastapi import APIRouter, HTTPException, Depends, Query
from routes.auth import get_user_from_token
from database import get_database
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin"])

def require_admin(user = Depends(get_user_from_token)):
    """Admin yetkisi kontrolü"""
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get("/users")
async def get_all_users(limit: int = Query(100, le=500), admin = Depends(require_admin)):
    """Tüm kullanıcıları listele (Admin)"""
    db = await get_database()
    
    users = await db.users.find(
        {},
        {"_id": 0, "password_hash": 0}
    ).limit(limit).to_list(None)
    
    return users

@router.get("/stats")
async def get_system_stats(admin = Depends(require_admin)):
    """Sistem geneli istatistikler (Admin)"""
    db = await get_database()
    
    total_users = await db.users.count_documents({})
    total_campaigns = await db.campaigns.count_documents({})
    total_clicks = await db.clicks.count_documents({})
    total_suspicious = await db.clicks.count_documents({"is_suspicious": True})
    total_pools = await db.pools.count_documents({})
    total_blocked_ips = await db.blocked_ips.count_documents({})
    
    return {
        "total_users": total_users,
        "total_campaigns": total_campaigns,
        "total_clicks": total_clicks,
        "total_suspicious_clicks": total_suspicious,
        "total_pools": total_pools,
        "total_blocked_ips": total_blocked_ips,
        "fraud_rate": round((total_suspicious / total_clicks * 100) if total_clicks > 0 else 0, 2)
    }

@router.post("/pools/{pool_code}/global-block")
async def set_pool_global_block(pool_code: str, admin = Depends(require_admin)):
    """Bir havuzu global engellemeye al (tüm havuzlar için geçerli)"""
    db = await get_database()
    
    # Havuzun tüm engellenmiş IP'lerini global yap
    result = await db.blocked_ips.update_many(
        {"pool_codes": pool_code},
        {"$set": {"is_global": True}}
    )
    
    logger.info(f"Admin set pool {pool_code} IPs to global block: {result.modified_count} IPs")
    
    return {"message": f"{result.modified_count} IPs set to global block"}
