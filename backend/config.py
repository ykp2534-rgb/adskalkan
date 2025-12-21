import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    # MongoDB
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME = os.environ.get('DB_NAME', 'adskalkan_db')
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # Fraud Detection Thresholds
    FRAUD_SCORE_THRESHOLD = 70  # 0-100
    CLICK_FREQUENCY_THRESHOLD = 5  # clicks per minute
    
    # Pagination
    DEFAULT_PAGE_SIZE = 50
    MAX_PAGE_SIZE = 500

settings = Settings()
