from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import configuration
from config import settings
from database import connect_to_mongo, close_mongo_connection

# Import routes
from routes import auth, campaigns, clicks, pools, analytics, admin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting AdsKalkan API...")
    await connect_to_mongo()
    logger.info("✅ AdsKalkan API is ready!")
    yield
    # Shutdown
    logger.info("👋 Shutting down AdsKalkan API...")
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title="AdsKalkan API",
    description="Google Ads Click Fraud Protection with Pool System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create main API router with /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "AdsKalkan API - Google Ads Click Fraud Protection",
        "version": "1.0.0",
        "status": "operational"
    }

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "adskalkan-api"}

# Include all routers
api_router.include_router(auth.router)
api_router.include_router(campaigns.router)
api_router.include_router(clicks.router)
api_router.include_router(pools.router)
api_router.include_router(analytics.router)
api_router.include_router(admin.router)

# Mount API router to app
app.include_router(api_router)

logger.info("🛡️ AdsKalkan - Kollektif Tıklama Koruma Sistemi Hazır!")
