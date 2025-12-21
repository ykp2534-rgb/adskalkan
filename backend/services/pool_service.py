from typing import List, Dict
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class PoolService:
    """Havuz sistemi yönetimi - Kollektif koruma"""
    
    @staticmethod
    def parse_pool_code(pool_code: str) -> Dict[str, str]:
        """
        Havuz kodunu parse eder
        Format: 34001 -> city_plate: 34, sector_code: 001
        """
        if len(pool_code) != 5:
            raise ValueError("Pool code must be 5 digits (CCSS - City Code + Sector Code)")
        
        return {
            "city_plate_code": pool_code[:2],
            "sector_code": pool_code[2:]
        }
    
    @staticmethod
    async def create_pool(db, pool_code: str, sector_name: str = None) -> dict:
        """
        Yeni havuz oluşturur
        """
        # Pool code'u parse et
        parsed = PoolService.parse_pool_code(pool_code)
        
        # Havuz zaten var mı kontrol et
        existing = await db.pools.find_one({"pool_code": pool_code})
        if existing:
            logger.warning(f"Pool {pool_code} already exists")
            return existing
        
        pool_data = {
            "pool_code": pool_code,
            "city_plate_code": parsed["city_plate_code"],
            "sector_code": parsed["sector_code"],
            "sector_name": sector_name,
            "member_count": 0,
            "total_blocked_ips": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_premium": True
        }
        
        await db.pools.insert_one(pool_data)
        logger.info(f"Pool created: {pool_code} - {sector_name}")
        
        return pool_data
    
    @staticmethod
    async def join_pool(db, user_id: str, pool_code: str, click_threshold: int = 1, block_duration_days: int = 7) -> bool:
        """
        Kullanıcıyı havuza ekler (ayarlarla)
        """
        # Havuz var mı kontrol et
        pool = await db.pools.find_one({"pool_code": pool_code})
        if not pool:
            logger.error(f"Pool {pool_code} not found")
            return False
        
        # Zaten üye mi kontrol et
        existing_member = await db.pool_members.find_one({
            "pool_code": pool_code,
            "user_id": user_id
        })
        
        if existing_member:
            # Ayarları güncelle
            await db.pool_members.update_one(
                {"pool_code": pool_code, "user_id": user_id},
                {"$set": {
                    "click_threshold": click_threshold,
                    "block_duration_days": block_duration_days,
                    "is_active": True
                }}
            )
            logger.info(f"User {user_id} settings updated for pool {pool_code}")
            return True
        
        # Üyelik oluştur (ayarlarla)
        member_data = {
            "pool_code": pool_code,
            "user_id": user_id,
            "joined_at": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
            "click_threshold": click_threshold,
            "block_duration_days": block_duration_days,
            "auto_renew": True
        }
        
        await db.pool_members.insert_one(member_data)
        
        # Pool member count güncelle
        await db.pools.update_one(
            {"pool_code": pool_code},
            {"$inc": {"member_count": 1}}
        )
        
        # User'ın pools_joined listesini güncelle
        await db.users.update_one(
            {"id": user_id},
            {"$addToSet": {"pools_joined": pool_code}}
        )
        
        logger.info(f"User {user_id} joined pool {pool_code} with threshold={click_threshold}, duration={block_duration_days}")
        return True
    
    @staticmethod
    async def get_pool_members(db, pool_code: str) -> List[str]:
        """
        Havuzdaki tüm üyeleri getirir
        """
        members = await db.pool_members.find(
            {"pool_code": pool_code, "is_active": True},
            {"user_id": 1, "_id": 0}
        ).to_list(None)
        
        return [m["user_id"] for m in members]
    
    @staticmethod
    async def get_user_pools(db, user_id: str) -> List[str]:
        """
        Kullanıcının üye olduğu havuzları getirir
        """
        user = await db.users.find_one({"id": user_id}, {"pools_joined": 1, "_id": 0})
        return user.get("pools_joined", []) if user else []
    
    @staticmethod
    async def block_ip_for_pool(db, ip_address: str, pool_code: str, reason: str, blocked_by_user_id: str, duration_days: int = 7):
        """
        HAVUZ İÇİN IP ENGELLER - Kollektif koruma
        Bir havuz üyesine şüpheli tıklama tespit edilince tüm havuz korunur
        """
        from datetime import timedelta
        
        # Önce IP zaten engellenmiş mi kontrol et
        existing_block = await db.blocked_ips.find_one({"ip_address": ip_address})
        
        expires_at = datetime.now(timezone.utc) + timedelta(days=duration_days)
        
        if existing_block:
            # IP zaten engelli, sadece pool_codes listesine ekle ve süreyi güncelle
            if pool_code not in existing_block.get("pool_codes", []):
                await db.blocked_ips.update_one(
                    {"ip_address": ip_address},
                    {
                        "$addToSet": {"pool_codes": pool_code},
                        "$inc": {"detection_count": 1},
                        "$set": {"expires_at": expires_at.isoformat()}
                    }
                )
                logger.info(f"IP {ip_address} added to pool {pool_code} blacklist (expires in {duration_days} days)")
        else:
            # Yeni engelleme
            block_data = {
                "ip_address": ip_address,
                "reason": reason,
                "pool_codes": [pool_code],
                "blocked_by_user_id": blocked_by_user_id,
                "blocked_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": expires_at.isoformat(),
                "is_global": False,
                "detection_count": 1
            }
            
            await db.blocked_ips.insert_one(block_data)
            
            # Pool'un total_blocked_ips sayısını artır
            await db.pools.update_one(
                {"pool_code": pool_code},
                {"$inc": {"total_blocked_ips": 1}}
            )
            
            logger.info(f"IP {ip_address} blocked for pool {pool_code} for {duration_days} days: {reason}")
    
    @staticmethod
    async def is_ip_blocked_for_user(db, ip_address: str, user_id: str) -> bool:
        """
        Bu IP, kullanıcının havuzlarından herhangi birinde engellenmiş mi?
        """
        # Kullanıcının havuzlarını al
        user_pools = await PoolService.get_user_pools(db, user_id)
        
        if not user_pools:
            return False
        
        # IP'nin engelleme kaydını kontrol et
        blocked_ip = await db.blocked_ips.find_one({"ip_address": ip_address})
        
        if not blocked_ip:
            return False
        
        # Global engelleme mi?
        if blocked_ip.get("is_global", False):
            return True
        
        # Kullanıcının havuzlarından herhangi biri engellenmiş mi?
        blocked_pools = blocked_ip.get("pool_codes", [])
        return any(pool in blocked_pools for pool in user_pools)

pool_service = PoolService()
