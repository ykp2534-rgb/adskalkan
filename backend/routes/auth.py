from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import UserCreate, UserLogin, User, Token, UserResponse
from utils.security import get_password_hash, verify_password, create_access_token, decode_access_token
from database import get_database
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    """Yeni kullanıcı kaydı"""
    db = await get_database()
    
    # Email zaten kayıtlı mı?
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Şifreyi hashle
    hashed_password = get_password_hash(user_data.password)
    
    # Kullanıcı oluştur
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role
    )
    
    user_dict = user.model_dump()
    user_dict['password_hash'] = hashed_password
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Token oluştur
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    
    logger.info(f"New user registered: {user.email}")
    
    return Token(
        access_token=access_token,
        user=UserResponse(**user.model_dump())
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Kullanıcı girişi"""
    db = await get_database()
    
    # Kullanıcıyı bul
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Şifreyi kontrol et
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Token oluştur
    access_token = create_access_token(data={"sub": user['id'], "email": user['email']})
    
    logger.info(f"User logged in: {user['email']}")
    
    return Token(
        access_token=access_token,
        user=UserResponse(**user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Mevcut kullanıcı bilgilerini getir"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    db = await get_database()
    user = await db.users.find_one({"id": payload.get("sub")})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return UserResponse(**user)

# Helper function for protected routes
async def get_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Token'dan kullanıcı bilgisini çıkar - diğer route'larda kullanılacak"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    db = await get_database()
    user = await db.users.find_one({"id": payload.get("sub")})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user
