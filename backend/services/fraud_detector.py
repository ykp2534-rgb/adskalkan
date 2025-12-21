from typing import Dict, List
import logging
from services.click_analyzer import click_analyzer
from services.pool_service import pool_service
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class FraudDetector:
    """Ana fraud detection ve response sistemi"""
    
    @staticmethod
    async def process_click(db, click_data: dict, user_id: str) -> Dict:
        """
        Gelen tıklamayı işler, analiz eder ve gerekirse engeller
        
        Bu fonksiyon:
        1. Tıklamayı analiz eder
        2. Şüpheli ise havuz sistemini tetikler
        3. Kollektif korumayı aktive eder
        4. Veritabanına kaydeder
        """
        ip_address = click_data.get('ip_address')
        campaign_id = click_data.get('campaign_id')
        
        # 1. Önce IP zaten kullanıcının havuzlarında engellenmiş mi kontrol et
        is_blocked = await pool_service.is_ip_blocked_for_user(db, ip_address, user_id)
        
        if is_blocked:
            logger.info(f"Click from blocked IP {ip_address} for user {user_id}")
            return {
                "status": "blocked",
                "message": "IP already blocked by pool protection",
                "is_suspicious": True,
                "is_blocked": True,
                "fraud_score": 100
            }
        
        # 2. Tıklamayı analiz et
        is_suspicious, fraud_score, fraud_reasons = await click_analyzer.analyze_click(
            click_data, db, user_id
        )
        
        # 3. Tıklamayı veritabanına kaydet
        click_record = {
            **click_data,
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "is_suspicious": is_suspicious,
            "is_blocked": is_blocked,
            "fraud_score": fraud_score,
            "fraud_reasons": fraud_reasons
        }
        
        await db.clicks.insert_one(click_record)
        
        # 4. Kampanya istatistiklerini güncelle
        update_data = {"$inc": {"total_clicks": 1}}
        if is_suspicious:
            update_data["$inc"]["suspicious_clicks_count"] = 1
        if is_blocked:
            update_data["$inc"]["blocked_clicks_count"] = 1
        
        await db.campaigns.update_one(
            {"id": campaign_id},
            update_data
        )
        
        # 5. ŞÜPHELİ İSE HAVUZ SİSTEMİNİ TETİKLE!
        if is_suspicious and fraud_score >= 70:
            await FraudDetector.trigger_pool_protection(db, ip_address, user_id, fraud_reasons)
        
        logger.info(f"Click processed: user={user_id}, IP={ip_address}, suspicious={is_suspicious}, score={fraud_score}")
        
        return {
            "status": "blocked" if is_blocked else ("suspicious" if is_suspicious else "clean"),
            "is_suspicious": is_suspicious,
            "is_blocked": is_blocked,
            "fraud_score": fraud_score,
            "fraud_reasons": fraud_reasons
        }
    
    @staticmethod
    async def trigger_pool_protection(db, ip_address: str, user_id: str, fraud_reasons: List[str]):
        """
        KOLLEKTİF KORUMA - HAVUZ SİSTEMİNİN KALBI!
        
        Bir kullanıcıya şüpheli tıklama geldi mi?
        → Kullanıcının tüm havuzlarındaki TÜM ÜYELERİ koru!
        """
        logger.warning(f"🚨 POOL PROTECTION TRIGGERED! IP: {ip_address}, User: {user_id}")
        
        # Kullanıcının üye olduğu havuzları al
        user_pools = await pool_service.get_user_pools(db, user_id)
        
        if not user_pools:
            logger.info(f"User {user_id} is not member of any pool")
            return
        
        reason = f"Fraud detected: {', '.join(fraud_reasons[:3])}"
        
        # Her havuz için IP'yi engelle
        for pool_code in user_pools:
            await pool_service.block_ip_for_pool(
                db, ip_address, pool_code, reason, user_id
            )
            
            logger.info(f"✅ Pool {pool_code} protected from IP {ip_address}")
        
        logger.warning(f"🛡️ COLLECTIVE PROTECTION: IP {ip_address} blocked for {len(user_pools)} pools")
    
    @staticmethod
    async def get_dashboard_stats(db, user_id: str) -> Dict:
        """
        Kullanıcı için dashboard istatistikleri
        """
        # Kullanıcının kampanyaları
        campaigns = await db.campaigns.find({"user_id": user_id}).to_list(None)
        campaign_ids = [c["id"] for c in campaigns]
        
        # Toplam istatistikler
        total_campaigns = len(campaigns)
        total_clicks = sum(c.get("total_clicks", 0) for c in campaigns)
        suspicious_clicks = sum(c.get("suspicious_clicks_count", 0) for c in campaigns)
        blocked_clicks = sum(c.get("blocked_clicks_count", 0) for c in campaigns)
        
        # Kullanıcının havuzları
        user_pools = await pool_service.get_user_pools(db, user_id)
        pool_details = await db.pools.find({"pool_code": {"$in": user_pools}}).to_list(None)
        
        # Son 24 saatteki tehditler
        from datetime import timedelta
        yesterday = datetime.now(timezone.utc) - timedelta(hours=24)
        recent_threats = await db.clicks.count_documents({
            "user_id": user_id,
            "is_suspicious": True,
            "timestamp": {"$gte": yesterday.isoformat()}
        })
        
        return {
            "total_campaigns": total_campaigns,
            "total_clicks": total_clicks,
            "suspicious_clicks": suspicious_clicks,
            "blocked_clicks": blocked_clicks,
            "clean_clicks": total_clicks - suspicious_clicks,
            "fraud_percentage": round((suspicious_clicks / total_clicks * 100) if total_clicks > 0 else 0, 2),
            "pools_joined": len(user_pools),
            "pool_details": pool_details,
            "recent_threats_24h": recent_threats,
            "money_saved_estimate": round(blocked_clicks * 2.5, 2)  # Ortalama 2.5 TL per click
        }

fraud_detector = FraudDetector()
