from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, BackgroundTasks, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import json
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'adskalkan')]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'adskalkan-super-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="AdsKalkan API", version="1.0.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== ENUMS ====================
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN_HELPER = "admin_helper"
    CUSTOMER = "customer"

class UserStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class PackageType(str, Enum):
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

# ==================== MODELS ====================
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    company_name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: UserRole = UserRole.CUSTOMER
    status: UserStatus = UserStatus.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    package_id: Optional[str] = None
    promo_end_date: Optional[datetime] = None
    promo_days: Optional[int] = None
    sites: List[str] = []

class Pool(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    sector: str
    city: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sites: List[str] = []
    blocked_ips: List[str] = []
    is_active: bool = True

class PoolCreate(BaseModel):
    name: str
    description: Optional[str] = None
    sector: str
    city: Optional[str] = None

class Site(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    domain: str
    name: str
    pool_id: Optional[str] = None
    tracker_code: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    total_visitors: int = 0
    blocked_clicks: int = 0

class SiteCreate(BaseModel):
    domain: str
    name: str
    pool_id: Optional[str] = None

class Package(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: PackageType
    price: float
    duration_days: int
    max_sites: int
    max_visitors_per_month: int
    features: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PackageCreate(BaseModel):
    name: str
    type: PackageType
    price: float
    duration_days: int
    max_sites: int
    max_visitors_per_month: int
    features: List[str] = []

class Campaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    discount_percent: float = 0
    promo_days: int = 0
    start_date: datetime
    end_date: datetime
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CampaignCreate(BaseModel):
    name: str
    description: Optional[str] = None
    discount_percent: float = 0
    promo_days: int = 0
    start_date: datetime
    end_date: datetime

class Visitor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_id: str
    tracker_code: str
    ip_address: str
    ip_type: Optional[str] = None  # datacenter, residential, vpn, proxy
    country: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    device_type: Optional[str] = None  # desktop, mobile, tablet
    device_brand: Optional[str] = None
    device_model: Optional[str] = None
    os: Optional[str] = None
    os_version: Optional[str] = None
    browser: Optional[str] = None
    browser_version: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    user_agent: Optional[str] = None
    referer: Optional[str] = None
    gclid: Optional[str] = None
    page_url: Optional[str] = None
    time_on_page: Optional[int] = None  # seconds
    scroll_depth: Optional[int] = None  # percentage
    click_count: Optional[int] = None
    mouse_movements: Optional[int] = None
    canvas_fingerprint: Optional[str] = None
    webgl_fingerprint: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    risk_score: float = 0
    risk_level: RiskLevel = RiskLevel.LOW
    risk_factors: List[str] = []
    is_blocked: bool = False
    blocked_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VisitorTrack(BaseModel):
    tracker_code: str
    ip_address: str
    ip_type: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    device_type: Optional[str] = None
    device_brand: Optional[str] = None
    device_model: Optional[str] = None
    os: Optional[str] = None
    os_version: Optional[str] = None
    browser: Optional[str] = None
    browser_version: Optional[str] = None
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    user_agent: Optional[str] = None
    referer: Optional[str] = None
    gclid: Optional[str] = None
    page_url: Optional[str] = None
    time_on_page: Optional[int] = None
    scroll_depth: Optional[int] = None
    click_count: Optional[int] = None
    mouse_movements: Optional[int] = None
    canvas_fingerprint: Optional[str] = None
    webgl_fingerprint: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None

class BlockedIP(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ip_address: str
    pool_id: Optional[str] = None
    site_id: Optional[str] = None
    reason: str
    risk_score: float
    risk_factors: List[str] = []
    blocked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    blocked_by: Optional[str] = None  # auto or admin id
    is_global: bool = False

class SiteSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hero_title: str = "AdsKalkan"
    hero_subtitle: str = "Google Ads Sahte Tıklama Koruma Sistemi"
    hero_description: str = "Reklam bütçenizi koruyun, sahte tıklamaları engelleyin"
    features: List[Dict[str, str]] = []
    pricing_title: str = "Paketlerimiz"
    contact_email: str = "info@adskalkan.com"
    contact_phone: str = ""
    footer_text: str = "© 2024 AdsKalkan. Tüm hakları saklıdır."
    primary_color: str = "#3b82f6"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Promotion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    promo_type: str  # free_trial, discount
    days: int
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: datetime
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class PromotionCreate(BaseModel):
    user_id: str
    promo_type: str
    days: int

# ==================== HELPER FUNCTIONS ====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi dolmuş")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token_data = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": token_data["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
    return user

async def require_super_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] not in [UserRole.SUPER_ADMIN, UserRole.ADMIN_HELPER]:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    return current_user

async def require_approved_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["status"] != UserStatus.APPROVED:
        raise HTTPException(status_code=403, detail="Hesabınız henüz onaylanmamış")
    return current_user

# Risk Engine import
from risk_engine import analyze_visitor_risk

# ==================== AUTH ROUTES ====================
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı")
    
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        company_name=user_data.company_name,
        phone=user_data.phone,
        role=UserRole.CUSTOMER,
        status=UserStatus.PENDING
    )
    
    user_dict = user.model_dump()
    user_dict["password_hash"] = hash_password(user_data.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    user_dict["updated_at"] = user_dict["updated_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    return {"message": "Kayıt başarılı. Hesabınız onay bekliyor.", "user_id": user.id}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    if not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    token = create_token(user["id"], user["role"])
    
    # Remove password hash from response
    user.pop("password_hash", None)
    
    return {"token": token, "user": user}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    current_user.pop("password_hash", None)
    return current_user

# ==================== USER MANAGEMENT ====================
@api_router.get("/admin/users")
async def get_users(
    status: Optional[str] = None,
    role: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(require_super_admin)
):
    query = {}
    if status:
        query["status"] = status
    if role:
        query["role"] = role
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}},
            {"company_name": {"$regex": search, "$options": "i"}}
        ]
    
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/approve")
async def approve_user(user_id: str, current_user: dict = Depends(require_super_admin)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"status": UserStatus.APPROVED, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {"message": "Kullanıcı onaylandı"}

@api_router.put("/admin/users/{user_id}/reject")
async def reject_user(user_id: str, current_user: dict = Depends(require_super_admin)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"status": UserStatus.REJECTED, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {"message": "Kullanıcı reddedildi"}

@api_router.put("/admin/users/{user_id}/suspend")
async def suspend_user(user_id: str, current_user: dict = Depends(require_super_admin)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"status": UserStatus.SUSPENDED, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {"message": "Kullanıcı askıya alındı"}

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: UserRole, current_user: dict = Depends(require_super_admin)):
    if current_user["role"] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Sadece süper admin rol değiştirebilir")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": role, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {"message": "Kullanıcı rolü güncellendi"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_super_admin)):
    if current_user["role"] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Sadece süper admin kullanıcı silebilir")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {"message": "Kullanıcı silindi"}

# ==================== POOL MANAGEMENT ====================
@api_router.post("/admin/pools")
async def create_pool(pool_data: PoolCreate, current_user: dict = Depends(require_super_admin)):
    pool = Pool(**pool_data.model_dump())
    pool_dict = pool.model_dump()
    pool_dict["created_at"] = pool_dict["created_at"].isoformat()
    pool_dict["updated_at"] = pool_dict["updated_at"].isoformat()
    
    await db.pools.insert_one(pool_dict)
    # Return without MongoDB _id
    del pool_dict["_id"] if "_id" in pool_dict else None
    return pool_dict

@api_router.get("/admin/pools")
async def get_pools(current_user: dict = Depends(require_super_admin)):
    pools = await db.pools.find({}, {"_id": 0}).to_list(1000)
    return pools

@api_router.get("/admin/pools/{pool_id}")
async def get_pool(pool_id: str, current_user: dict = Depends(require_super_admin)):
    pool = await db.pools.find_one({"id": pool_id}, {"_id": 0})
    if not pool:
        raise HTTPException(status_code=404, detail="Havuz bulunamadı")
    return pool

@api_router.put("/admin/pools/{pool_id}")
async def update_pool(pool_id: str, pool_data: PoolCreate, current_user: dict = Depends(require_super_admin)):
    result = await db.pools.update_one(
        {"id": pool_id},
        {"$set": {**pool_data.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Havuz bulunamadı")
    return {"message": "Havuz güncellendi"}

@api_router.delete("/admin/pools/{pool_id}")
async def delete_pool(pool_id: str, current_user: dict = Depends(require_super_admin)):
    result = await db.pools.delete_one({"id": pool_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Havuz bulunamadı")
    return {"message": "Havuz silindi"}

# ==================== PACKAGE MANAGEMENT ====================
@api_router.post("/admin/packages")
async def create_package(package_data: PackageCreate, current_user: dict = Depends(require_super_admin)):
    package = Package(**package_data.model_dump())
    package_dict = package.model_dump()
    package_dict["created_at"] = package_dict["created_at"].isoformat()
    
    await db.packages.insert_one(package_dict)
    return package_dict

@api_router.get("/packages")
async def get_packages():
    packages = await db.packages.find({"is_active": True}, {"_id": 0}).to_list(100)
    return packages

@api_router.get("/admin/packages")
async def get_all_packages(current_user: dict = Depends(require_super_admin)):
    packages = await db.packages.find({}, {"_id": 0}).to_list(100)
    return packages

@api_router.put("/admin/packages/{package_id}")
async def update_package(package_id: str, package_data: PackageCreate, current_user: dict = Depends(require_super_admin)):
    result = await db.packages.update_one(
        {"id": package_id},
        {"$set": package_data.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Paket bulunamadı")
    return {"message": "Paket güncellendi"}

@api_router.delete("/admin/packages/{package_id}")
async def delete_package(package_id: str, current_user: dict = Depends(require_super_admin)):
    result = await db.packages.delete_one({"id": package_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Paket bulunamadı")
    return {"message": "Paket silindi"}

# ==================== CAMPAIGN MANAGEMENT ====================
@api_router.post("/admin/campaigns")
async def create_campaign(campaign_data: CampaignCreate, current_user: dict = Depends(require_super_admin)):
    campaign = Campaign(**campaign_data.model_dump())
    campaign_dict = campaign.model_dump()
    campaign_dict["created_at"] = campaign_dict["created_at"].isoformat()
    campaign_dict["start_date"] = campaign_dict["start_date"].isoformat()
    campaign_dict["end_date"] = campaign_dict["end_date"].isoformat()
    
    await db.campaigns.insert_one(campaign_dict)
    return campaign_dict

@api_router.get("/admin/campaigns")
async def get_campaigns(current_user: dict = Depends(require_super_admin)):
    campaigns = await db.campaigns.find({}, {"_id": 0}).to_list(100)
    return campaigns

@api_router.put("/admin/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, campaign_data: CampaignCreate, current_user: dict = Depends(require_super_admin)):
    update_data = campaign_data.model_dump()
    update_data["start_date"] = update_data["start_date"].isoformat()
    update_data["end_date"] = update_data["end_date"].isoformat()
    
    result = await db.campaigns.update_one(
        {"id": campaign_id},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Kampanya bulunamadı")
    return {"message": "Kampanya güncellendi"}

@api_router.delete("/admin/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, current_user: dict = Depends(require_super_admin)):
    result = await db.campaigns.delete_one({"id": campaign_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kampanya bulunamadı")
    return {"message": "Kampanya silindi"}

# ==================== PROMOTION MANAGEMENT ====================
@api_router.post("/admin/promotions")
async def create_promotion(promo_data: PromotionCreate, current_user: dict = Depends(require_super_admin)):
    end_date = datetime.now(timezone.utc) + timedelta(days=promo_data.days)
    
    promotion = Promotion(
        user_id=promo_data.user_id,
        promo_type=promo_data.promo_type,
        days=promo_data.days,
        end_date=end_date,
        created_by=current_user["id"]
    )
    
    promo_dict = promotion.model_dump()
    promo_dict["start_date"] = promo_dict["start_date"].isoformat()
    promo_dict["end_date"] = promo_dict["end_date"].isoformat()
    promo_dict["created_at"] = promo_dict["created_at"].isoformat()
    
    await db.promotions.insert_one(promo_dict)
    
    # Update user's promo info
    await db.users.update_one(
        {"id": promo_data.user_id},
        {"$set": {
            "promo_end_date": end_date.isoformat(),
            "promo_days": promo_data.days,
            "status": UserStatus.APPROVED
        }}
    )
    
    return promo_dict

@api_router.get("/admin/promotions")
async def get_promotions(current_user: dict = Depends(require_super_admin)):
    promotions = await db.promotions.find({}, {"_id": 0}).to_list(1000)
    return promotions

# ==================== SITE MANAGEMENT ====================
@api_router.post("/sites")
async def create_site(site_data: SiteCreate, current_user: dict = Depends(require_approved_user)):
    site = Site(
        user_id=current_user["id"],
        domain=site_data.domain,
        name=site_data.name,
        pool_id=site_data.pool_id
    )
    
    site_dict = site.model_dump()
    site_dict["created_at"] = site_dict["created_at"].isoformat()
    
    await db.sites.insert_one(site_dict)
    
    # If pool_id is set, add site to pool
    if site_data.pool_id:
        await db.pools.update_one(
            {"id": site_data.pool_id},
            {"$push": {"sites": site.id}}
        )
    
    return site_dict

@api_router.get("/sites")
async def get_my_sites(current_user: dict = Depends(require_approved_user)):
    sites = await db.sites.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return sites

@api_router.get("/admin/sites")
async def get_all_sites(current_user: dict = Depends(require_super_admin)):
    sites = await db.sites.find({}, {"_id": 0}).to_list(1000)
    return sites

@api_router.get("/sites/{site_id}")
async def get_site(site_id: str, current_user: dict = Depends(require_approved_user)):
    site = await db.sites.find_one({"id": site_id}, {"_id": 0})
    if not site:
        raise HTTPException(status_code=404, detail="Site bulunamadı")
    
    # Check ownership unless admin
    if current_user["role"] == UserRole.CUSTOMER and site["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu siteye erişim yetkiniz yok")
    
    return site

@api_router.get("/sites/{site_id}/tracker-code")
async def get_tracker_code(site_id: str, current_user: dict = Depends(require_approved_user)):
    site = await db.sites.find_one({"id": site_id}, {"_id": 0})
    if not site:
        raise HTTPException(status_code=404, detail="Site bulunamadı")
    
    if current_user["role"] == UserRole.CUSTOMER and site["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu siteye erişim yetkiniz yok")
    
    # Generate JS tracker code
    tracker_js = f"""<!-- AdsKalkan Tracker -->
<script>
(function() {{
  var ak = window.AdsKalkan = window.AdsKalkan || {{}};
  ak.tracker = '{site["tracker_code"]}';
  ak.endpoint = '{os.environ.get("API_URL", "https://api.adskalkan.com")}/api/track';
  
  var data = {{
    tracker_code: ak.tracker,
    page_url: window.location.href,
    referer: document.referrer,
    screen_width: screen.width,
    screen_height: screen.height,
    user_agent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    gclid: new URLSearchParams(window.location.search).get('gclid')
  }};
  
  var startTime = Date.now();
  var scrollMax = 0;
  var mouseCount = 0;
  var clickCount = 0;
  
  document.addEventListener('scroll', function() {{
    var scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > scrollMax) scrollMax = scrollPercent;
  }});
  
  document.addEventListener('mousemove', function() {{ mouseCount++; }});
  document.addEventListener('click', function() {{ clickCount++; }});
  
  window.addEventListener('beforeunload', function() {{
    data.time_on_page = Math.round((Date.now() - startTime) / 1000);
    data.scroll_depth = scrollMax;
    data.mouse_movements = mouseCount;
    data.click_count = clickCount;
    navigator.sendBeacon(ak.endpoint, JSON.stringify(data));
  }});
  
  // Initial track
  fetch(ak.endpoint, {{
    method: 'POST',
    headers: {{'Content-Type': 'application/json'}},
    body: JSON.stringify(data)
  }});
}})();
</script>
<!-- End AdsKalkan Tracker -->"""
    
    return {"tracker_code": site["tracker_code"], "script": tracker_js}

# ==================== TRACKING & ANALYTICS ====================
@api_router.post("/track")
async def track_visitor(visitor_data: VisitorTrack, request: Request):
    # Get site by tracker code
    site = await db.sites.find_one({"tracker_code": visitor_data.tracker_code}, {"_id": 0})
    if not site:
        raise HTTPException(status_code=404, detail="Geçersiz tracker kodu")
    
    # Get IP from request if not provided
    ip_address = visitor_data.ip_address or request.client.host
    
    # Get recent visitors for this site (last 24 hours for pattern analysis)
    yesterday = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    recent_visitors = await db.visitors.find(
        {"site_id": site["id"], "created_at": {"$gte": yesterday}},
        {"_id": 0}
    ).sort("created_at", -1).limit(500).to_list(500)
    
    # Get blocked IPs from pool
    pool_blocked_ips = []
    if site.get("pool_id"):
        pool = await db.pools.find_one({"id": site["pool_id"]}, {"_id": 0})
        if pool:
            pool_blocked_ips = pool.get("blocked_ips", [])
    
    # Get globally blocked IPs
    global_blocked = await db.blocked_ips.find({"is_global": True}, {"_id": 0}).to_list(10000)
    blocked_ips = [b["ip_address"] for b in global_blocked]
    
    # Prepare visitor data for analysis
    visitor_dict = visitor_data.model_dump()
    visitor_dict["ip_address"] = ip_address
    
    # Use advanced risk engine for analysis
    risk_score, risk_factors, risk_level, should_block = await analyze_visitor_risk(
        visitor_dict, 
        recent_visitors, 
        blocked_ips,
        pool_blocked_ips
    )
    
    # Extract factor descriptions for storage
    factor_descriptions = [f.get("factor", "") for f in risk_factors if isinstance(f, dict)]
    
    # Create visitor record
    visitor = Visitor(
        site_id=site["id"],
        tracker_code=visitor_data.tracker_code,
        ip_address=ip_address,
        ip_type=visitor_data.ip_type,
        country=visitor_data.country,
        city=visitor_data.city,
        district=visitor_data.district,
        latitude=visitor_data.latitude,
        longitude=visitor_data.longitude,
        device_type=visitor_data.device_type,
        device_brand=visitor_data.device_brand,
        device_model=visitor_data.device_model,
        os=visitor_data.os,
        os_version=visitor_data.os_version,
        browser=visitor_data.browser,
        browser_version=visitor_data.browser_version,
        screen_width=visitor_data.screen_width,
        screen_height=visitor_data.screen_height,
        user_agent=visitor_data.user_agent,
        referer=visitor_data.referer,
        gclid=visitor_data.gclid,
        page_url=visitor_data.page_url,
        time_on_page=visitor_data.time_on_page,
        scroll_depth=visitor_data.scroll_depth,
        click_count=visitor_data.click_count,
        mouse_movements=visitor_data.mouse_movements,
        canvas_fingerprint=visitor_data.canvas_fingerprint,
        webgl_fingerprint=visitor_data.webgl_fingerprint,
        timezone=visitor_data.timezone,
        language=visitor_data.language,
        risk_score=risk_score,
        risk_level=RiskLevel(risk_level),
        risk_factors=factor_descriptions,
        is_blocked=should_block,
        blocked_reason="; ".join(factor_descriptions[:3]) if should_block else None
    )
    
    visitor_dict_db = visitor.model_dump()
    visitor_dict_db["created_at"] = visitor_dict_db["created_at"].isoformat()
    # Store full risk analysis
    visitor_dict_db["risk_analysis"] = risk_factors
    
    await db.visitors.insert_one(visitor_dict_db)
    
    # Update site stats
    await db.sites.update_one(
        {"id": site["id"]},
        {
            "$inc": {
                "total_visitors": 1,
                "blocked_clicks": 1 if should_block else 0
            }
        }
    )
    
    # If blocked, add to pool's blocked IPs and blocked_ips collection
    if should_block and site.get("pool_id"):
        await db.pools.update_one(
            {"id": site["pool_id"]},
            {"$addToSet": {"blocked_ips": ip_address}}
        )
        
        # Add to blocked_ips collection with full details
        blocked_ip = BlockedIP(
            ip_address=ip_address,
            pool_id=site.get("pool_id"),
            site_id=site["id"],
            reason="; ".join(factor_descriptions[:5]),
            risk_score=risk_score,
            risk_factors=factor_descriptions,
            blocked_by="auto"
        )
        blocked_dict = blocked_ip.model_dump()
        blocked_dict["blocked_at"] = blocked_dict["blocked_at"].isoformat()
        blocked_dict["risk_analysis"] = risk_factors  # Full analysis
        await db.blocked_ips.insert_one(blocked_dict)
    
    return {
        "status": "blocked" if should_block else "allowed",
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors[:3] if should_block else []  # Return top 3 factors
    }

@api_router.get("/visitors")
async def get_my_visitors(
    site_id: Optional[str] = None,
    risk_level: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    city: Optional[str] = None,
    device_type: Optional[str] = None,
    is_blocked: Optional[bool] = None,
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(require_approved_user)
):
    # Get user's sites
    user_sites = await db.sites.find({"user_id": current_user["id"]}, {"id": 1}).to_list(100)
    site_ids = [s["id"] for s in user_sites]
    
    query = {"site_id": {"$in": site_ids}}
    
    if site_id:
        query["site_id"] = site_id
    if risk_level:
        query["risk_level"] = risk_level
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if device_type:
        query["device_type"] = device_type
    if is_blocked is not None:
        query["is_blocked"] = is_blocked
    if start_date:
        query["created_at"] = {"$gte": start_date}
    if end_date:
        if "created_at" in query:
            query["created_at"]["$lte"] = end_date
        else:
            query["created_at"] = {"$lte": end_date}
    
    skip = (page - 1) * limit
    visitors = await db.visitors.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.visitors.count_documents(query)
    
    return {"visitors": visitors, "total": total, "page": page, "limit": limit}

@api_router.get("/admin/visitors")
async def get_all_visitors(
    site_id: Optional[str] = None,
    risk_level: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    city: Optional[str] = None,
    district: Optional[str] = None,
    country: Optional[str] = None,
    device_type: Optional[str] = None,
    device_brand: Optional[str] = None,
    browser: Optional[str] = None,
    os: Optional[str] = None,
    ip_type: Optional[str] = None,
    is_blocked: Optional[bool] = None,
    min_time_on_page: Optional[int] = None,
    max_time_on_page: Optional[int] = None,
    min_risk_score: Optional[float] = None,
    max_risk_score: Optional[float] = None,
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(require_super_admin)
):
    query = {}
    
    if site_id:
        query["site_id"] = site_id
    if risk_level:
        query["risk_level"] = risk_level
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if district:
        query["district"] = {"$regex": district, "$options": "i"}
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    if device_type:
        query["device_type"] = device_type
    if device_brand:
        query["device_brand"] = {"$regex": device_brand, "$options": "i"}
    if browser:
        query["browser"] = {"$regex": browser, "$options": "i"}
    if os:
        query["os"] = {"$regex": os, "$options": "i"}
    if ip_type:
        query["ip_type"] = ip_type
    if is_blocked is not None:
        query["is_blocked"] = is_blocked
    if start_date:
        query["created_at"] = {"$gte": start_date}
    if end_date:
        if "created_at" in query:
            query["created_at"]["$lte"] = end_date
        else:
            query["created_at"] = {"$lte": end_date}
    if min_time_on_page is not None:
        query["time_on_page"] = {"$gte": min_time_on_page}
    if max_time_on_page is not None:
        if "time_on_page" in query:
            query["time_on_page"]["$lte"] = max_time_on_page
        else:
            query["time_on_page"] = {"$lte": max_time_on_page}
    if min_risk_score is not None:
        query["risk_score"] = {"$gte": min_risk_score}
    if max_risk_score is not None:
        if "risk_score" in query:
            query["risk_score"]["$lte"] = max_risk_score
        else:
            query["risk_score"] = {"$lte": max_risk_score}
    
    skip = (page - 1) * limit
    visitors = await db.visitors.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.visitors.count_documents(query)
    
    return {"visitors": visitors, "total": total, "page": page, "limit": limit}

# ==================== BLOCKED IPS ====================
@api_router.get("/admin/blocked-ips")
async def get_blocked_ips(
    pool_id: Optional[str] = None,
    is_global: Optional[bool] = None,
    current_user: dict = Depends(require_super_admin)
):
    query = {}
    if pool_id:
        query["pool_id"] = pool_id
    if is_global is not None:
        query["is_global"] = is_global
    
    blocked = await db.blocked_ips.find(query, {"_id": 0}).to_list(10000)
    return blocked

@api_router.post("/admin/blocked-ips")
async def add_blocked_ip(
    ip_address: str,
    reason: str,
    is_global: bool = False,
    pool_id: Optional[str] = None,
    current_user: dict = Depends(require_super_admin)
):
    blocked_ip = BlockedIP(
        ip_address=ip_address,
        pool_id=pool_id,
        reason=reason,
        risk_score=100,
        risk_factors=[reason],
        blocked_by=current_user["id"],
        is_global=is_global
    )
    
    blocked_dict = blocked_ip.model_dump()
    blocked_dict["blocked_at"] = blocked_dict["blocked_at"].isoformat()
    
    await db.blocked_ips.insert_one(blocked_dict)
    
    if pool_id:
        await db.pools.update_one(
            {"id": pool_id},
            {"$addToSet": {"blocked_ips": ip_address}}
        )
    
    return blocked_dict

@api_router.delete("/admin/blocked-ips/{ip_id}")
async def remove_blocked_ip(ip_id: str, current_user: dict = Depends(require_super_admin)):
    blocked = await db.blocked_ips.find_one({"id": ip_id}, {"_id": 0})
    if not blocked:
        raise HTTPException(status_code=404, detail="Engelli IP bulunamadı")
    
    await db.blocked_ips.delete_one({"id": ip_id})
    
    if blocked.get("pool_id"):
        await db.pools.update_one(
            {"id": blocked["pool_id"]},
            {"$pull": {"blocked_ips": blocked["ip_address"]}}
        )
    
    return {"message": "IP engeli kaldırıldı"}

# ==================== DASHBOARD & STATS ====================
@api_router.get("/dashboard")
async def get_customer_dashboard(current_user: dict = Depends(require_approved_user)):
    # Get user's sites
    sites = await db.sites.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    site_ids = [s["id"] for s in sites]
    
    # Get visitor stats
    total_visitors = await db.visitors.count_documents({"site_id": {"$in": site_ids}})
    blocked_visitors = await db.visitors.count_documents({"site_id": {"$in": site_ids}, "is_blocked": True})
    
    # Get today's stats
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_visitors = await db.visitors.count_documents({
        "site_id": {"$in": site_ids},
        "created_at": {"$gte": today.isoformat()}
    })
    today_blocked = await db.visitors.count_documents({
        "site_id": {"$in": site_ids},
        "is_blocked": True,
        "created_at": {"$gte": today.isoformat()}
    })
    
    # Get last 7 days stats
    week_ago = today - timedelta(days=7)
    daily_stats = []
    for i in range(7):
        day = week_ago + timedelta(days=i)
        next_day = day + timedelta(days=1)
        count = await db.visitors.count_documents({
            "site_id": {"$in": site_ids},
            "created_at": {"$gte": day.isoformat(), "$lt": next_day.isoformat()}
        })
        blocked = await db.visitors.count_documents({
            "site_id": {"$in": site_ids},
            "is_blocked": True,
            "created_at": {"$gte": day.isoformat(), "$lt": next_day.isoformat()}
        })
        daily_stats.append({
            "date": day.strftime("%Y-%m-%d"),
            "visitors": count,
            "blocked": blocked
        })
    
    return {
        "sites": sites,
        "total_visitors": total_visitors,
        "blocked_visitors": blocked_visitors,
        "today_visitors": today_visitors,
        "today_blocked": today_blocked,
        "daily_stats": daily_stats,
        "protection_rate": round((blocked_visitors / total_visitors * 100) if total_visitors > 0 else 0, 2)
    }

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(current_user: dict = Depends(require_super_admin)):
    # Get counts
    total_users = await db.users.count_documents({})
    pending_users = await db.users.count_documents({"status": UserStatus.PENDING})
    total_sites = await db.sites.count_documents({})
    total_pools = await db.pools.count_documents({})
    total_visitors = await db.visitors.count_documents({})
    blocked_visitors = await db.visitors.count_documents({"is_blocked": True})
    total_blocked_ips = await db.blocked_ips.count_documents({})
    
    # Get today's stats
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_visitors = await db.visitors.count_documents({"created_at": {"$gte": today.isoformat()}})
    today_blocked = await db.visitors.count_documents({"is_blocked": True, "created_at": {"$gte": today.isoformat()}})
    
    # Get last 30 days stats
    month_ago = today - timedelta(days=30)
    daily_stats = []
    for i in range(30):
        day = month_ago + timedelta(days=i)
        next_day = day + timedelta(days=1)
        count = await db.visitors.count_documents({
            "created_at": {"$gte": day.isoformat(), "$lt": next_day.isoformat()}
        })
        blocked = await db.visitors.count_documents({
            "is_blocked": True,
            "created_at": {"$gte": day.isoformat(), "$lt": next_day.isoformat()}
        })
        daily_stats.append({
            "date": day.strftime("%Y-%m-%d"),
            "visitors": count,
            "blocked": blocked
        })
    
    # Get risk level distribution
    risk_distribution = {
        "low": await db.visitors.count_documents({"risk_level": RiskLevel.LOW}),
        "medium": await db.visitors.count_documents({"risk_level": RiskLevel.MEDIUM}),
        "high": await db.visitors.count_documents({"risk_level": RiskLevel.HIGH}),
        "critical": await db.visitors.count_documents({"risk_level": RiskLevel.CRITICAL})
    }
    
    # Get top blocked IPs
    pipeline = [
        {"$match": {"is_blocked": True}},
        {"$group": {"_id": "$ip_address", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    top_blocked_ips = await db.visitors.aggregate(pipeline).to_list(10)
    
    # Get device type distribution
    device_pipeline = [
        {"$group": {"_id": "$device_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    device_distribution = await db.visitors.aggregate(device_pipeline).to_list(10)
    
    # Get city distribution
    city_pipeline = [
        {"$match": {"city": {"$ne": None}}},
        {"$group": {"_id": "$city", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    city_distribution = await db.visitors.aggregate(city_pipeline).to_list(10)
    
    return {
        "total_users": total_users,
        "pending_users": pending_users,
        "total_sites": total_sites,
        "total_pools": total_pools,
        "total_visitors": total_visitors,
        "blocked_visitors": blocked_visitors,
        "total_blocked_ips": total_blocked_ips,
        "today_visitors": today_visitors,
        "today_blocked": today_blocked,
        "daily_stats": daily_stats,
        "risk_distribution": risk_distribution,
        "top_blocked_ips": top_blocked_ips,
        "device_distribution": device_distribution,
        "city_distribution": city_distribution,
        "protection_rate": round((blocked_visitors / total_visitors * 100) if total_visitors > 0 else 0, 2)
    }

# ==================== SITE SETTINGS ====================
@api_router.get("/settings")
async def get_site_settings():
    settings = await db.site_settings.find_one({}, {"_id": 0})
    if not settings:
        default_settings = SiteSettings()
        settings_dict = default_settings.model_dump()
        settings_dict["updated_at"] = settings_dict["updated_at"].isoformat()
        await db.site_settings.insert_one(settings_dict)
        return settings_dict
    return settings

@api_router.put("/admin/settings")
async def update_site_settings(settings: dict, current_user: dict = Depends(require_super_admin)):
    settings["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.site_settings.update_one({}, {"$set": settings}, upsert=True)
    return {"message": "Ayarlar güncellendi"}

# ==================== REPORTS ====================
@api_router.get("/reports/export")
async def export_report(
    report_type: str = "visitors",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    format: str = "json",
    current_user: dict = Depends(require_approved_user)
):
    query = {}
    
    if current_user["role"] == UserRole.CUSTOMER:
        sites = await db.sites.find({"user_id": current_user["id"]}, {"id": 1}).to_list(100)
        site_ids = [s["id"] for s in sites]
        query["site_id"] = {"$in": site_ids}
    
    if start_date:
        query["created_at"] = {"$gte": start_date}
    if end_date:
        if "created_at" in query:
            query["created_at"]["$lte"] = end_date
        else:
            query["created_at"] = {"$lte": end_date}
    
    if report_type == "visitors":
        data = await db.visitors.find(query, {"_id": 0}).to_list(10000)
    elif report_type == "blocked":
        query["is_blocked"] = True
        data = await db.visitors.find(query, {"_id": 0}).to_list(10000)
    else:
        raise HTTPException(status_code=400, detail="Geçersiz rapor tipi")
    
    return {"data": data, "count": len(data)}

# ==================== HEALTH CHECK ====================
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# ==================== INITIALIZATION ====================
@app.on_event("startup")
async def startup_event():
    """Initialize database with super admin if not exists"""
    # Check if super admin exists
    super_admin = await db.users.find_one({"email": "ykp2534@gmail.com"})
    if not super_admin:
        admin = User(
            email="ykp2534@gmail.com",
            full_name="Super Admin",
            role=UserRole.SUPER_ADMIN,
            status=UserStatus.APPROVED
        )
        admin_dict = admin.model_dump()
        admin_dict["password_hash"] = hash_password("Y@kup253499")
        admin_dict["created_at"] = admin_dict["created_at"].isoformat()
        admin_dict["updated_at"] = admin_dict["updated_at"].isoformat()
        await db.users.insert_one(admin_dict)
        logger.info("Super admin created successfully")
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.sites.create_index("tracker_code", unique=True)
    await db.sites.create_index("user_id")
    await db.visitors.create_index("site_id")
    await db.visitors.create_index("ip_address")
    await db.visitors.create_index("created_at")
    await db.pools.create_index("id", unique=True)
    await db.blocked_ips.create_index("ip_address")
    
    logger.info("Database indexes created")

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
