from fastapi import APIRouter, HTTPException, Depends, Query
from models.pool import Pool, PoolCreate, PoolMemberCreate, PoolStats
from models.blocked_ip import BlockedIP
from routes.auth import get_user_from_token
from database import get_database
from services.pool_service import pool_service
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/pools", tags=["Pools"])

@router.post("", response_model=Pool)
async def create_pool(pool_data: PoolCreate, user = Depends(get_user_from_token)):
    """Yeni havuz oluştur (Operator veya Admin)"""
    db = await get_database()
    
    # Sadece operator veya admin oluşturabilir
    if user['role'] not in ['operator', 'admin']:
        raise HTTPException(status_code=403, detail="Only operators can create pools")
    
    pool = await pool_service.create_pool(
        db,
        pool_data.pool_code,
        pool_data.sector_name
    )
    
    return pool

@router.get("", response_model=List[Pool])
async def get_pools(
    city_plate_code: str = None,
    limit: int = Query(100, le=500),
    user = Depends(get_user_from_token)
):
    """Tüm havuzları listele"""
    db = await get_database()
    
    query = {}
    if city_plate_code:
        query["city_plate_code"] = city_plate_code
    
    pools = await db.pools.find(query, {"_id": 0}).limit(limit).to_list(None)
    
    return pools

@router.get("/my-pools", response_model=List[Pool])
async def get_my_pools(user = Depends(get_user_from_token)):
    """Kullanıcının üye olduğu havuzlar"""
    db = await get_database()
    
    user_pools = await pool_service.get_user_pools(db, user['id'])
    
    if not user_pools:
        return []
    
    pools = await db.pools.find({"pool_code": {"$in": user_pools}}, {"_id": 0}).to_list(None)
    
    return pools

@router.post("/join")
async def join_pool(membership: PoolMemberCreate, user = Depends(get_user_from_token)):
    """Havuza katıl (ayarlarla)"""
    db = await get_database()
    
    # Ayarları doğrula
    if membership.click_threshold < 1 or membership.click_threshold > 10:
        raise HTTPException(status_code=400, detail="Click threshold must be between 1-10")
    
    if membership.block_duration_days < 1 or membership.block_duration_days > 30:
        raise HTTPException(status_code=400, detail="Block duration must be between 1-30 days")
    
    success = await pool_service.join_pool(
        db, 
        user['id'], 
        membership.pool_code,
        membership.click_threshold,
        membership.block_duration_days
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Could not join pool")
    
    return {
        "message": f"Successfully joined pool {membership.pool_code}",
        "settings": {
            "click_threshold": membership.click_threshold,
            "block_duration_days": membership.block_duration_days
        }
    }

@router.get("/{pool_code}", response_model=Pool)
async def get_pool(pool_code: str, user = Depends(get_user_from_token)):
    """Havuz detayları"""
    db = await get_database()
    
    pool = await db.pools.find_one({"pool_code": pool_code}, {"_id": 0})
    
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found")
    
    return pool

@router.get("/{pool_code}/stats", response_model=PoolStats)
async def get_pool_stats(pool_code: str, user = Depends(get_user_from_token)):
    """Havuz istatistikleri"""
    db = await get_database()
    
    pool = await db.pools.find_one({"pool_code": pool_code})
    
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found")
    
    # Son 24 saatteki tehditler
    from datetime import datetime, timedelta, timezone
    yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
    
    recent_threats = await db.blocked_ips.count_documents({
        "pool_codes": pool_code,
        "blocked_at": {"$gte": yesterday.isoformat()}
    })
    
    return PoolStats(
        pool_code=pool['pool_code'],
        sector_name=pool.get('sector_name'),
        member_count=pool['member_count'],
        total_blocked_ips=pool['total_blocked_ips'],
        recent_threats=recent_threats
    )

@router.get("/{pool_code}/blocked-ips", response_model=List[BlockedIP])
async def get_pool_blocked_ips(
    pool_code: str,
    limit: int = Query(100, le=500),
    user = Depends(get_user_from_token)
):
    """Havuzun engellenen IP'leri"""
    db = await get_database()
    
    # Kullanıcı bu havuzun üyesi mi?
    is_member = await db.pool_members.find_one({
        "pool_code": pool_code,
        "user_id": user['id'],
        "is_active": True
    })
    
    if not is_member and user['role'] not in ['operator', 'admin']:
        raise HTTPException(status_code=403, detail="Not a member of this pool")
    
    blocked_ips = await db.blocked_ips.find(
        {"pool_codes": pool_code},
        {"_id": 0}
    ).sort("blocked_at", -1).limit(limit).to_list(None)
    
    return blocked_ips

@router.put("/{pool_code}/sector")
async def update_pool_sector(
    pool_code: str,
    sector_name: str,
    user = Depends(get_user_from_token)
):
    """Havuza sektör adı ata (Operator)"""
    db = await get_database()
    
    # Sadece operator veya admin atayabilir
    if user['role'] not in ['operator', 'admin']:
        raise HTTPException(status_code=403, detail="Only operators can assign sectors")
    
    result = await db.pools.update_one(
        {"pool_code": pool_code},
        {"$set": {"sector_name": sector_name}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Pool not found")
    
    logger.info(f"Operator {user['email']} assigned sector '{sector_name}' to pool {pool_code}")
    
    return {"message": f"Sector '{sector_name}' assigned to pool {pool_code}"}
