"""
AdsKalkan Gelişmiş Risk Analiz Motoru
=====================================
Çok katmanlı, ağırlıklı puanlama sistemi ile sahte tıklama tespiti
"""

from typing import Dict, List, Tuple, Optional
from datetime import datetime, timezone, timedelta
from enum import Enum
import re
import logging

logger = logging.getLogger(__name__)


class RiskLevel(str, Enum):
    LOW = "low"           # 0-30: Güvenli
    MEDIUM = "medium"     # 31-50: Şüpheli - İzle
    HIGH = "high"         # 51-70: Riskli - Uyar
    CRITICAL = "critical" # 71-100: Engelle


class RiskCategory(str, Enum):
    IP = "ip"
    DEVICE = "device"
    BEHAVIOR = "behavior"
    FINGERPRINT = "fingerprint"
    PATTERN = "pattern"
    BLACKLIST = "blacklist"


# ==================== AĞIRLIK KONFIGÜRASYONU ====================
# Her kategori için maksimum puan ve ağırlık
CATEGORY_WEIGHTS = {
    RiskCategory.IP: {"weight": 0.25, "max_score": 100},
    RiskCategory.DEVICE: {"weight": 0.15, "max_score": 100},
    RiskCategory.BEHAVIOR: {"weight": 0.30, "max_score": 100},
    RiskCategory.FINGERPRINT: {"weight": 0.15, "max_score": 100},
    RiskCategory.PATTERN: {"weight": 0.15, "max_score": 100},
}

# Bilinen bot user agent'ları
BOT_USER_AGENTS = [
    "bot", "crawler", "spider", "scraper", "headless",
    "phantom", "selenium", "puppeteer", "playwright",
    "wget", "curl", "python-requests", "httpclient",
    "java", "perl", "ruby", "go-http-client"
]

# Şüpheli IP aralıkları (Datacenter/Cloud)
SUSPICIOUS_IP_RANGES = [
    "104.16.",    # Cloudflare
    "172.64.",    # Cloudflare
    "34.64.",     # Google Cloud
    "35.192.",    # Google Cloud
    "13.52.",     # AWS
    "18.144.",    # AWS
    "52.52.",     # AWS
    "54.183.",    # AWS
    "157.240.",   # Facebook
    "31.13.",     # Facebook
]

# Şüpheli ISP'ler
SUSPICIOUS_ISPS = [
    "amazon", "aws", "google cloud", "microsoft azure",
    "digitalocean", "linode", "vultr", "ovh", "hetzner",
    "hostinger", "contabo"
]

# Bilinen VPN/Proxy servisleri
VPN_PROVIDERS = [
    "nordvpn", "expressvpn", "surfshark", "protonvpn",
    "cyberghost", "private internet access", "ipvanish",
    "tunnelbear", "windscribe", "hotspot shield"
]


class RiskEngine:
    """Gelişmiş Risk Analiz Motoru"""
    
    def __init__(self, db=None):
        self.db = db
        self.blocked_ips_cache = set()
        self.suspicious_fingerprints_cache = set()
    
    async def analyze(
        self,
        visitor_data: Dict,
        recent_visitors: List[Dict],
        blocked_ips: List[str],
        pool_blocked_ips: List[str] = None
    ) -> Tuple[float, List[Dict], RiskLevel, bool]:
        """
        Ana analiz fonksiyonu
        
        Returns:
            - risk_score: 0-100 arası toplam risk skoru
            - risk_factors: Detaylı risk faktörleri listesi
            - risk_level: Risk seviyesi (low/medium/high/critical)
            - should_block: Engellenecek mi?
        """
        
        all_blocked = set(blocked_ips or [])
        if pool_blocked_ips:
            all_blocked.update(pool_blocked_ips)
        
        risk_factors = []
        category_scores = {}
        
        # 1. BLACKLIST KONTROLÜ (Anında engelle)
        ip = visitor_data.get("ip_address", "")
        if ip in all_blocked:
            return 100, [{"category": "blacklist", "factor": "IP daha önce engellenmiş", "score": 100, "severity": "critical"}], RiskLevel.CRITICAL, True
        
        # 2. IP ANALİZİ
        ip_score, ip_factors = self._analyze_ip(visitor_data, recent_visitors, all_blocked)
        category_scores[RiskCategory.IP] = ip_score
        risk_factors.extend(ip_factors)
        
        # 3. CİHAZ ANALİZİ
        device_score, device_factors = self._analyze_device(visitor_data)
        category_scores[RiskCategory.DEVICE] = device_score
        risk_factors.extend(device_factors)
        
        # 4. DAVRANIŞ ANALİZİ
        behavior_score, behavior_factors = self._analyze_behavior(visitor_data)
        category_scores[RiskCategory.BEHAVIOR] = behavior_score
        risk_factors.extend(behavior_factors)
        
        # 5. FINGERPRINT ANALİZİ
        fingerprint_score, fingerprint_factors = self._analyze_fingerprint(visitor_data, recent_visitors)
        category_scores[RiskCategory.FINGERPRINT] = fingerprint_score
        risk_factors.extend(fingerprint_factors)
        
        # 6. PATTERN ANALİZİ (Geçmiş verilerle karşılaştırma)
        pattern_score, pattern_factors = self._analyze_patterns(visitor_data, recent_visitors)
        category_scores[RiskCategory.PATTERN] = pattern_score
        risk_factors.extend(pattern_factors)
        
        # TOPLAM SKOR HESAPLA
        total_score = self._calculate_weighted_score(category_scores)
        
        # RİSK SEVİYESİ BELİRLE
        risk_level = self._determine_risk_level(total_score)
        
        # ENGELLEME KARARI
        should_block = risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]
        
        # Kritik faktör varsa direkt engelle
        critical_factors = [f for f in risk_factors if f.get("severity") == "critical"]
        if critical_factors:
            should_block = True
            if total_score < 70:
                total_score = 70
        
        logger.info(f"Risk Analysis Complete - IP: {ip}, Score: {total_score}, Level: {risk_level}, Block: {should_block}")
        
        return round(total_score, 2), risk_factors, risk_level, should_block
    
    def _analyze_ip(self, visitor_data: Dict, recent_visitors: List[Dict], blocked_ips: set) -> Tuple[float, List[Dict]]:
        """IP bazlı risk analizi"""
        score = 0
        factors = []
        ip = visitor_data.get("ip_address", "")
        ip_type = visitor_data.get("ip_type", "").lower()
        
        # 1. IP Tipi Kontrolü
        if ip_type in ["datacenter", "hosting"]:
            score += 40
            factors.append({
                "category": "ip",
                "factor": f"Datacenter IP tespit edildi",
                "score": 40,
                "severity": "high",
                "details": f"IP Tipi: {ip_type}"
            })
        elif ip_type in ["vpn", "proxy"]:
            score += 35
            factors.append({
                "category": "ip",
                "factor": f"VPN/Proxy kullanımı tespit edildi",
                "score": 35,
                "severity": "high",
                "details": f"IP Tipi: {ip_type}"
            })
        elif ip_type == "tor":
            score += 50
            factors.append({
                "category": "ip",
                "factor": "TOR ağı kullanımı",
                "score": 50,
                "severity": "critical",
                "details": "TOR exit node tespit edildi"
            })
        
        # 2. Bilinen Şüpheli IP Aralıkları
        for suspicious_range in SUSPICIOUS_IP_RANGES:
            if ip.startswith(suspicious_range):
                score += 25
                factors.append({
                    "category": "ip",
                    "factor": "Şüpheli IP aralığı",
                    "score": 25,
                    "severity": "medium",
                    "details": f"Cloud/CDN IP: {suspicious_range}*"
                })
                break
        
        # 3. Aynı IP'den Tekrarlı Ziyaretler (Son 1 saat)
        one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        same_ip_recent = [v for v in recent_visitors 
                         if v.get("ip_address") == ip 
                         and v.get("created_at", "") > one_hour_ago]
        
        if len(same_ip_recent) >= 10:
            score += 30
            factors.append({
                "category": "ip",
                "factor": "Çok fazla tekrarlı ziyaret",
                "score": 30,
                "severity": "high",
                "details": f"Son 1 saatte {len(same_ip_recent)} ziyaret"
            })
        elif len(same_ip_recent) >= 5:
            score += 15
            factors.append({
                "category": "ip",
                "factor": "Tekrarlı ziyaret",
                "score": 15,
                "severity": "medium",
                "details": f"Son 1 saatte {len(same_ip_recent)} ziyaret"
            })
        
        # 4. Aynı IP farklı cihazlardan (Bot farm belirtisi)
        same_ip_devices = set()
        for v in recent_visitors:
            if v.get("ip_address") == ip:
                device_key = f"{v.get('device_type')}-{v.get('device_brand')}-{v.get('os')}"
                same_ip_devices.add(device_key)
        
        if len(same_ip_devices) >= 5:
            score += 35
            factors.append({
                "category": "ip",
                "factor": "Aynı IP'den farklı cihazlar",
                "score": 35,
                "severity": "critical",
                "details": f"{len(same_ip_devices)} farklı cihaz profili (Bot farm şüphesi)"
            })
        
        # 5. ISP Analizi
        isp = visitor_data.get("isp", "").lower()
        for suspicious_isp in SUSPICIOUS_ISPS:
            if suspicious_isp in isp:
                score += 20
                factors.append({
                    "category": "ip",
                    "factor": "Şüpheli ISP/Hosting",
                    "score": 20,
                    "severity": "medium",
                    "details": f"ISP: {isp}"
                })
                break
        
        return min(score, 100), factors
    
    def _analyze_device(self, visitor_data: Dict) -> Tuple[float, List[Dict]]:
        """Cihaz bazlı risk analizi"""
        score = 0
        factors = []
        
        user_agent = (visitor_data.get("user_agent") or "").lower()
        device_type = visitor_data.get("device_type", "")
        os_name = visitor_data.get("os", "")
        browser = visitor_data.get("browser", "")
        screen_width = visitor_data.get("screen_width")
        screen_height = visitor_data.get("screen_height")
        
        # 1. Bot User Agent Kontrolü
        for bot_ua in BOT_USER_AGENTS:
            if bot_ua in user_agent:
                score += 50
                factors.append({
                    "category": "device",
                    "factor": "Bot User-Agent tespit edildi",
                    "score": 50,
                    "severity": "critical",
                    "details": f"Pattern: {bot_ua}"
                })
                break
        
        # 2. Eksik/Boş User Agent
        if not user_agent or len(user_agent) < 20:
            score += 30
            factors.append({
                "category": "device",
                "factor": "Eksik veya kısa User-Agent",
                "score": 30,
                "severity": "high",
                "details": "Normal tarayıcılar detaylı UA gönderir"
            })
        
        # 3. Headless Browser Belirtileri
        headless_indicators = ["headless", "phantomjs", "electron", "nightmare"]
        for indicator in headless_indicators:
            if indicator in user_agent:
                score += 45
                factors.append({
                    "category": "device",
                    "factor": "Headless browser tespit edildi",
                    "score": 45,
                    "severity": "critical",
                    "details": f"Indicator: {indicator}"
                })
                break
        
        # 4. Şüpheli Ekran Çözünürlüğü
        if screen_width and screen_height:
            # Çok küçük veya sıfır çözünürlük
            if screen_width < 300 or screen_height < 300:
                score += 25
                factors.append({
                    "category": "device",
                    "factor": "Anormal ekran çözünürlüğü",
                    "score": 25,
                    "severity": "medium",
                    "details": f"{screen_width}x{screen_height} - Bot belirtisi"
                })
            # Yaygın olmayan çözünürlükler
            common_widths = [320, 375, 414, 768, 1024, 1280, 1366, 1440, 1536, 1920, 2560]
            if screen_width not in common_widths and screen_width > 300:
                score += 10
                factors.append({
                    "category": "device",
                    "factor": "Nadir ekran çözünürlüğü",
                    "score": 10,
                    "severity": "low",
                    "details": f"{screen_width}x{screen_height}"
                })
        
        # 5. OS ve Browser Uyumsuzluğu
        if os_name and browser:
            # Safari sadece Apple cihazlarda olmalı
            if "safari" in browser.lower() and "mac" not in os_name.lower() and "ios" not in os_name.lower():
                score += 20
                factors.append({
                    "category": "device",
                    "factor": "OS-Browser uyumsuzluğu",
                    "score": 20,
                    "severity": "medium",
                    "details": f"{browser} on {os_name} - Spoof şüphesi"
                })
            # IE sadece Windows'ta
            if "internet explorer" in browser.lower() and "windows" not in os_name.lower():
                score += 20
                factors.append({
                    "category": "device",
                    "factor": "OS-Browser uyumsuzluğu",
                    "score": 20,
                    "severity": "medium",
                    "details": f"{browser} on {os_name} - Spoof şüphesi"
                })
        
        # 6. Eksik Cihaz Bilgileri
        missing_count = 0
        if not device_type:
            missing_count += 1
        if not os_name:
            missing_count += 1
        if not browser:
            missing_count += 1
        
        if missing_count >= 2:
            score += 15
            factors.append({
                "category": "device",
                "factor": "Eksik cihaz bilgileri",
                "score": 15,
                "severity": "medium",
                "details": f"{missing_count} bilgi eksik"
            })
        
        return min(score, 100), factors
    
    def _analyze_behavior(self, visitor_data: Dict) -> Tuple[float, List[Dict]]:
        """Davranış bazlı risk analizi - EN ÖNEMLİ KATEGORİ"""
        score = 0
        factors = []
        
        time_on_page = visitor_data.get("time_on_page")  # saniye
        scroll_depth = visitor_data.get("scroll_depth")  # yüzde
        click_count = visitor_data.get("click_count")
        mouse_movements = visitor_data.get("mouse_movements")
        gclid = visitor_data.get("gclid")
        referer = visitor_data.get("referer", "")
        
        # 1. Sayfa Süresi Analizi
        if time_on_page is not None:
            if time_on_page < 2:
                score += 35
                factors.append({
                    "category": "behavior",
                    "factor": "Çok kısa sayfa süresi",
                    "score": 35,
                    "severity": "critical",
                    "details": f"{time_on_page} saniye - Bot davranışı"
                })
            elif time_on_page < 5:
                score += 20
                factors.append({
                    "category": "behavior",
                    "factor": "Kısa sayfa süresi",
                    "score": 20,
                    "severity": "high",
                    "details": f"{time_on_page} saniye"
                })
            elif time_on_page < 10:
                score += 10
                factors.append({
                    "category": "behavior",
                    "factor": "Düşük sayfa süresi",
                    "score": 10,
                    "severity": "medium",
                    "details": f"{time_on_page} saniye"
                })
        
        # 2. Scroll Derinliği
        if scroll_depth is not None:
            if scroll_depth == 0:
                score += 25
                factors.append({
                    "category": "behavior",
                    "factor": "Hiç scroll yapılmadı",
                    "score": 25,
                    "severity": "high",
                    "details": "Sayfa hiç kaydırılmadı"
                })
            elif scroll_depth < 10:
                score += 15
                factors.append({
                    "category": "behavior",
                    "factor": "Çok düşük scroll",
                    "score": 15,
                    "severity": "medium",
                    "details": f"%{scroll_depth} scroll"
                })
        
        # 3. Mouse Hareketleri
        if mouse_movements is not None:
            if mouse_movements == 0:
                score += 30
                factors.append({
                    "category": "behavior",
                    "factor": "Hiç mouse hareketi yok",
                    "score": 30,
                    "severity": "critical",
                    "details": "Bot davranışı - Mouse takip edilemedi"
                })
            elif mouse_movements < 10:
                score += 15
                factors.append({
                    "category": "behavior",
                    "factor": "Çok az mouse hareketi",
                    "score": 15,
                    "severity": "medium",
                    "details": f"{mouse_movements} hareket"
                })
        
        # 4. Click Pattern
        if click_count is not None and time_on_page is not None and time_on_page > 0:
            clicks_per_second = click_count / time_on_page
            if clicks_per_second > 2:  # Saniyede 2'den fazla tıklama
                score += 25
                factors.append({
                    "category": "behavior",
                    "factor": "Anormal tıklama hızı",
                    "score": 25,
                    "severity": "high",
                    "details": f"{clicks_per_second:.2f} tık/sn - Otomatik tıklama şüphesi"
                })
        
        # 5. Google Ads Kontrolü (gclid)
        is_from_google = referer and ("google" in referer.lower() or "gclid" in referer.lower())
        
        if is_from_google and not gclid:
            score += 20
            factors.append({
                "category": "behavior",
                "factor": "Google'dan geldi ama gclid yok",
                "score": 20,
                "severity": "medium",
                "details": "Reklam tıklaması doğrulanamadı"
            })
        
        # 6. Şüpheli Referer
        if referer:
            suspicious_referers = ["click", "traffic", "visitor", "bot", "earn", "ptc"]
            for sus in suspicious_referers:
                if sus in referer.lower():
                    score += 30
                    factors.append({
                        "category": "behavior",
                        "factor": "Şüpheli kaynak site",
                        "score": 30,
                        "severity": "high",
                        "details": f"Referer: {referer[:50]}"
                    })
                    break
        
        # 7. Doğrudan Giriş + Google Ads (Şüpheli)
        if gclid and not referer:
            score += 15
            factors.append({
                "category": "behavior",
                "factor": "gclid var ama referer yok",
                "score": 15,
                "severity": "medium",
                "details": "Manipüle edilmiş URL olabilir"
            })
        
        return min(score, 100), factors
    
    def _analyze_fingerprint(self, visitor_data: Dict, recent_visitors: List[Dict]) -> Tuple[float, List[Dict]]:
        """Fingerprint bazlı analiz"""
        score = 0
        factors = []
        
        canvas_fp = visitor_data.get("canvas_fingerprint")
        webgl_fp = visitor_data.get("webgl_fingerprint")
        timezone_str = visitor_data.get("timezone")
        language = visitor_data.get("language")
        city = visitor_data.get("city")
        
        # 1. Canvas Fingerprint - Aynı fingerprint farklı IP'lerden
        if canvas_fp:
            same_fp_different_ip = [v for v in recent_visitors 
                                   if v.get("canvas_fingerprint") == canvas_fp 
                                   and v.get("ip_address") != visitor_data.get("ip_address")]
            if len(same_fp_different_ip) >= 3:
                score += 35
                factors.append({
                    "category": "fingerprint",
                    "factor": "Aynı cihaz fingerprint farklı IP'lerden",
                    "score": 35,
                    "severity": "critical",
                    "details": f"{len(same_fp_different_ip)} farklı IP - VPN/Proxy kullanımı"
                })
        
        # 2. Eksik Fingerprint (Bot belirtisi)
        if not canvas_fp and not webgl_fp:
            score += 20
            factors.append({
                "category": "fingerprint",
                "factor": "Fingerprint alınamadı",
                "score": 20,
                "severity": "medium",
                "details": "Canvas/WebGL fingerprint eksik"
            })
        
        # 3. Timezone - Lokasyon Uyumsuzluğu
        if timezone_str and city:
            # Basit kontrol: Türkiye şehri ama farklı timezone
            turkish_cities = ["istanbul", "ankara", "izmir", "bursa", "antalya", "adana", "konya"]
            is_turkish_city = any(tc in city.lower() for tc in turkish_cities)
            is_turkish_tz = "europe/istanbul" in timezone_str.lower() or "+03" in timezone_str
            
            if is_turkish_city and not is_turkish_tz:
                score += 25
                factors.append({
                    "category": "fingerprint",
                    "factor": "Timezone-Lokasyon uyumsuzluğu",
                    "score": 25,
                    "severity": "high",
                    "details": f"Şehir: {city}, Timezone: {timezone_str}"
                })
        
        # 4. Language - Lokasyon Uyumsuzluğu
        if language and city:
            is_turkish_city = any(tc in city.lower() for tc in ["istanbul", "ankara", "izmir", "bursa", "antalya"])
            is_turkish_lang = "tr" in language.lower()
            
            if is_turkish_city and not is_turkish_lang:
                score += 10
                factors.append({
                    "category": "fingerprint",
                    "factor": "Dil-Lokasyon uyumsuzluğu",
                    "score": 10,
                    "severity": "low",
                    "details": f"Şehir: {city}, Dil: {language}"
                })
        
        return min(score, 100), factors
    
    def _analyze_patterns(self, visitor_data: Dict, recent_visitors: List[Dict]) -> Tuple[float, List[Dict]]:
        """Geçmiş verilerle pattern analizi"""
        score = 0
        factors = []
        
        ip = visitor_data.get("ip_address")
        city = visitor_data.get("city")
        district = visitor_data.get("district")
        device_brand = visitor_data.get("device_brand")
        
        # 1. Aynı şehir/ilçeden yoğun trafik (Click farm şüphesi)
        if city and district:
            same_location = [v for v in recent_visitors 
                           if v.get("city") == city and v.get("district") == district]
            
            if len(same_location) >= 20:
                score += 25
                factors.append({
                    "category": "pattern",
                    "factor": "Aynı lokasyondan yoğun trafik",
                    "score": 25,
                    "severity": "high",
                    "details": f"{city}/{district} - {len(same_location)} ziyaret (Click farm şüphesi)"
                })
        
        # 2. Aynı cihaz markasından çok fazla (Emulator farm)
        if device_brand:
            same_brand = [v for v in recent_visitors if v.get("device_brand") == device_brand]
            total_visitors = len(recent_visitors) or 1
            brand_ratio = len(same_brand) / total_visitors
            
            if brand_ratio > 0.5 and len(same_brand) >= 10:
                score += 20
                factors.append({
                    "category": "pattern",
                    "factor": "Tek cihaz markası dominasyonu",
                    "score": 20,
                    "severity": "medium",
                    "details": f"%{int(brand_ratio*100)} {device_brand} - Emulator şüphesi"
                })
        
        # 3. Benzer zaman aralığında toplu giriş (Coordinated attack)
        recent_count = len(recent_visitors)
        if recent_count >= 50:
            score += 15
            factors.append({
                "category": "pattern",
                "factor": "Yoğun trafik paterni",
                "score": 15,
                "severity": "medium",
                "details": f"Son dönemde {recent_count} ziyaret - Koordineli saldırı olabilir"
            })
        
        # 4. IP bloğu analizi (Aynı /24 subnet'ten çok fazla)
        if ip:
            ip_parts = ip.split(".")
            if len(ip_parts) >= 3:
                subnet = ".".join(ip_parts[:3])
                same_subnet = [v for v in recent_visitors 
                              if v.get("ip_address", "").startswith(subnet)]
                
                if len(same_subnet) >= 10:
                    score += 20
                    factors.append({
                        "category": "pattern",
                        "factor": "Aynı IP bloğundan trafik",
                        "score": 20,
                        "severity": "high",
                        "details": f"{subnet}.* subnet'inden {len(same_subnet)} ziyaret"
                    })
        
        return min(score, 100), factors
    
    def _calculate_weighted_score(self, category_scores: Dict[RiskCategory, float]) -> float:
        """Ağırlıklı toplam skor hesapla"""
        total_score = 0
        
        for category, score in category_scores.items():
            weight = CATEGORY_WEIGHTS.get(category, {}).get("weight", 0.1)
            max_score = CATEGORY_WEIGHTS.get(category, {}).get("max_score", 100)
            
            # Normalize et ve ağırlıkla çarp
            normalized = min(score, max_score) / max_score
            total_score += normalized * weight * 100
        
        return min(total_score, 100)
    
    def _determine_risk_level(self, score: float) -> RiskLevel:
        """Skora göre risk seviyesi belirle"""
        if score >= 70:
            return RiskLevel.CRITICAL
        elif score >= 50:
            return RiskLevel.HIGH
        elif score >= 30:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW


# Singleton instance
risk_engine = RiskEngine()


async def analyze_visitor_risk(
    visitor_data: Dict,
    recent_visitors: List[Dict],
    blocked_ips: List[str],
    pool_blocked_ips: List[str] = None
) -> Tuple[float, List[Dict], str, bool]:
    """
    Ziyaretçi risk analizi yap
    
    Args:
        visitor_data: Ziyaretçi bilgileri
        recent_visitors: Son ziyaretçiler listesi
        blocked_ips: Global engelli IP'ler
        pool_blocked_ips: Havuzdaki engelli IP'ler
    
    Returns:
        (risk_score, risk_factors, risk_level, should_block)
    """
    score, factors, level, block = await risk_engine.analyze(
        visitor_data, 
        recent_visitors, 
        blocked_ips,
        pool_blocked_ips
    )
    return score, factors, level.value, block
