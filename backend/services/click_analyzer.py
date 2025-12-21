from typing import Dict, List, Tuple
from datetime import datetime, timedelta, timezone
from collections import defaultdict
import re

class ClickAnalyzer:
    """Gerçek zamanlı tıklama analiz motoru - Şüpheli tıklama tespiti"""
    
    def __init__(self):
        # Bot user agent patterns
        self.bot_patterns = [
            r'bot', r'crawler', r'spider', r'scraper', r'curl', r'wget',
            r'python-requests', r'headless', r'phantom', r'selenium'
        ]
        
    async def analyze_click(self, click_data: dict, db, user_id: str, user_pool_settings: dict = None) -> Tuple[bool, int, List[str]]:
        """
        Bir tıklamayı analiz eder ve şüpheli olup olmadığını belirler
        user_pool_settings: Kullanıcının havuz ayarları (click_threshold)
        
        Returns:
            (is_suspicious, fraud_score, fraud_reasons)
        """
        fraud_score = 0
        fraud_reasons = []
        
        ip_address = click_data.get('ip_address')
        campaign_id = click_data.get('campaign_id')
        user_agent = click_data.get('user_agent', '')
        
        # 1. IP zaten engellenmiş mi kontrol et
        blocked_ip = await db.blocked_ips.find_one({"ip_address": ip_address})
        if blocked_ip:
            # Engelleme süresi dolmuş mu kontrol et
            expires_at = blocked_ip.get('expires_at')
            if expires_at:
                from datetime import datetime
                expires_datetime = datetime.fromisoformat(expires_at) if isinstance(expires_at, str) else expires_at
                if datetime.now(timezone.utc) > expires_datetime:
                    # Süre dolmuş, engellemeyi kaldır
                    await db.blocked_ips.delete_one({"ip_address": ip_address})
                    logger.info(f"IP {ip_address} block expired and removed")
                else:
                    fraud_score += 100
                    fraud_reasons.append("IP already blocked")
                    return True, fraud_score, fraud_reasons
            else:
                fraud_score += 100
                fraud_reasons.append("IP already blocked")
                return True, fraud_score, fraud_reasons
        
        # 2. Bot detection (User Agent analizi)
        if user_agent:
            for pattern in self.bot_patterns:
                if re.search(pattern, user_agent.lower()):
                    fraud_score += 40
                    fraud_reasons.append("Bot user agent detected")
                    break
        
        # 3. Click frequency analizi (KULLANICININ THRESHOLD AYARINA GÖRE)
        # Varsayılan: 1 dakika içinde kullanıcının threshold ayarına göre kontrol
        threshold = 5  # Varsayılan
        if user_pool_settings:
            threshold = user_pool_settings.get('click_threshold', 1)
        
        one_minute_ago = datetime.now(timezone.utc) - timedelta(minutes=1)
        recent_clicks = await db.clicks.count_documents({
            "ip_address": ip_address,
            "timestamp": {"$gte": one_minute_ago.isoformat()}
        })
        
        if recent_clicks >= threshold:
            fraud_score += 30
            fraud_reasons.append(f"Threshold exceeded: {recent_clicks} clicks (limit: {threshold})")
        
        # 4. Aynı IP'den farklı kampanyalara tıklama (Cross-campaign fraud)
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        campaigns_clicked = await db.clicks.distinct("campaign_id", {
            "ip_address": ip_address,
            "user_id": user_id,
            "timestamp": {"$gte": one_hour_ago.isoformat()}
        })
        
        if len(campaigns_clicked) > 3:
            fraud_score += 25
            fraud_reasons.append(f"Multiple campaigns targeted: {len(campaigns_clicked)}")
        
        # 5. Aynı IP'den farklı kullanıcılara tıklama (Competitor attack)
        users_targeted = await db.clicks.distinct("user_id", {
            "ip_address": ip_address,
            "timestamp": {"$gte": one_hour_ago.isoformat()}
        })
        
        if len(users_targeted) > 2:
            fraud_score += 30
            fraud_reasons.append(f"Multiple users targeted: {len(users_targeted)}")
        
        # 6. Suspicious referer
        referer = click_data.get('referer', '')
        if not referer or referer == 'direct':
            fraud_score += 5
            fraud_reasons.append("No referer or direct traffic")
        
        # 7. Device fingerprint analizi (gelecekte daha gelişmiş olabilir)
        # Şimdilik basit kontrol
        
        # 8. Location anomaly (Türkiye dışından gelen tıklamalar)
        location_country = click_data.get('location_country', 'TR')
        if location_country != 'TR':
            fraud_score += 20
            fraud_reasons.append(f"Non-TR traffic: {location_country}")
        
        # Final karar
        is_suspicious = fraud_score >= 70
        
        return is_suspicious, min(fraud_score, 100), fraud_reasons
    
    async def get_click_statistics(self, db, user_id: str = None, campaign_id: str = None) -> dict:
        """
        Tıklama istatistiklerini getirir
        """
        query = {}
        if user_id:
            query["user_id"] = user_id
        if campaign_id:
            query["campaign_id"] = campaign_id
        
        total_clicks = await db.clicks.count_documents(query)
        
        suspicious_query = {**query, "is_suspicious": True}
        suspicious_clicks = await db.clicks.count_documents(suspicious_query)
        
        blocked_query = {**query, "is_blocked": True}
        blocked_clicks = await db.clicks.count_documents(blocked_query)
        
        # Device breakdown
        device_pipeline = [
            {"$match": query},
            {"$group": {"_id": "$device_type", "count": {"$sum": 1}}}
        ]
        device_stats = await db.clicks.aggregate(device_pipeline).to_list(None)
        devices = {item["_id"]: item["count"] for item in device_stats}
        
        return {
            "total_clicks": total_clicks,
            "suspicious_clicks": suspicious_clicks,
            "blocked_clicks": blocked_clicks,
            "clean_clicks": total_clicks - suspicious_clicks,
            "fraud_percentage": round((suspicious_clicks / total_clicks * 100) if total_clicks > 0 else 0, 2),
            "devices": devices
        }

click_analyzer = ClickAnalyzer()
