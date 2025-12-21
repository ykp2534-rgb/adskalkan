from fastapi import APIRouter, HTTPException, Depends, Query
from models.pool import Pool, PoolCreate, PoolMemberCreate, PoolStats, OperatorCreatePool
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


@router.post("/operator/create-pool", response_model=Pool)
async def operator_create_pool(pool_data: OperatorCreatePool, user = Depends(get_user_from_token)):
    """Operator: Yeni havuz oluştur - şehir ve sektör seçimi"""
    db = await get_database()
    
    # Sadece operator veya admin oluşturabilir
    if user['role'] not in ['operator', 'admin']:
        raise HTTPException(status_code=403, detail="Only operators can create pools")
    
    # Şehir için sonraki sektör kodunu bul
    existing_pools = await db.pools.find({"city_plate_code": pool_data.city_plate_code}).to_list(None)
    
    if existing_pools:
        # Son sektör kodunu bul
        sector_codes = [int(p['sector_code']) for p in existing_pools]
        next_sector_code = max(sector_codes) + 1
    else:
        next_sector_code = 1
    
    # Pool code oluştur
    pool_code = f"{pool_data.city_plate_code}{str(next_sector_code).zfill(3)}"
    
    # Havuz oluştur
    pool = await pool_service.create_pool(
        db,
        pool_code,
        pool_data.sector_name
    )
    
    # Fiyatı güncelle
    await db.pools.update_one(
        {"pool_code": pool_code},
        {"$set": {"membership_price": pool_data.membership_price}}
    )
    
    logger.info(f"Operator {user['email']} created pool {pool_code}: {pool_data.sector_name}")
    
    return {**pool, "membership_price": pool_data.membership_price}

@router.get("/operator/cities")
async def get_cities(user = Depends(get_user_from_token)):
    """Operator: Türkiye şehir listesi"""
    if user['role'] not in ['operator', 'admin']:
        raise HTTPException(status_code=403, detail="Only operators can access this")
    
    cities = {
        "01": "Adana", "02": "Adıyaman", "03": "Afyonkarahisar", "04": "Ağrı", "05": "Amasya",
        "06": "Ankara", "07": "Antalya", "08": "Artvin", "09": "Aydın", "10": "Balıkesir",
        "11": "Bilecik", "12": "Bingöl", "13": "Bitlis", "14": "Bolu", "15": "Burdur",
        "16": "Bursa", "17": "Çanakkale", "18": "Çankırı", "19": "Çorum", "20": "Denizli",
        "21": "Diyarbakır", "22": "Edirne", "23": "Elazığ", "24": "Erzincan", "25": "Erzurum",
        "26": "Eskişehir", "27": "Gaziantep", "28": "Giresun", "29": "Gümüşhane", "30": "Hakkari",
        "31": "Hatay", "32": "Isparta", "33": "Mersin", "34": "İstanbul", "35": "İzmir",
        "36": "Kars", "37": "Kastamonu", "38": "Kayseri", "39": "Kırklareli", "40": "Kırşehir",
        "41": "Kocaeli", "42": "Konya", "43": "Kütahya", "44": "Malatya", "45": "Manisa",
        "46": "Kahramanmaraş", "47": "Mardin", "48": "Muğla", "49": "Muş", "50": "Nevşehir",
        "51": "Niğde", "52": "Ordu", "53": "Rize", "54": "Sakarya", "55": "Samsun",
        "56": "Siirt", "57": "Sinop", "58": "Sivas", "59": "Tekirdağ", "60": "Tokat",
        "61": "Trabzon", "62": "Tunceli", "63": "Şanlıurfa", "64": "Uşak", "65": "Van",
        "66": "Yozgat", "67": "Zonguldak", "68": "Aksaray", "69": "Bayburt", "70": "Karaman",
        "71": "Kırıkkale", "72": "Batman", "73": "Şırnak", "74": "Bartın", "75": "Ardahan",
        "76": "Iğdır", "77": "Yalova", "78": "Karabük", "79": "Kilis", "80": "Osmaniye", "81": "Düzce"
    }
    
    return [{"code": k, "name": v} for k, v in cities.items()]

@router.get("/operator/stats")
async def operator_stats(user = Depends(get_user_from_token)):
    """Operator: Genel havuz istatistikleri"""
    db = await get_database()
    
    if user['role'] not in ['operator', 'admin']:
        raise HTTPException(status_code=403, detail="Only operators can access this")
    
    total_pools = await db.pools.count_documents({})
    total_members = await db.pool_members.count_documents({"is_active": True})
    total_blocked_ips = await db.blocked_ips.count_documents({})
    
    # Şehir bazında havuz sayısı
    city_pipeline = [
        {"$group": {"_id": "$city_plate_code", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    top_cities = await db.pools.aggregate(city_pipeline).to_list(None)
    
    return {
        "total_pools": total_pools,
        "total_members": total_members,
        "total_blocked_ips": total_blocked_ips,
        "top_cities": top_cities
    }

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
