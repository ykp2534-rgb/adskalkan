from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    
db_instance = Database()

async def get_database():
    return db_instance.client[settings.DB_NAME]

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    db_instance.client = AsyncIOMotorClient(settings.MONGO_URL)
    logger.info("Connected to MongoDB successfully!")
    
    # Create indexes for optimization
    db = db_instance.client[settings.DB_NAME]
    
    # Users indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id")
    
    # Campaigns indexes
    await db.campaigns.create_index("user_id")
    await db.campaigns.create_index("id")
    
    # Clicks indexes (CRITICAL for performance)
    await db.clicks.create_index("campaign_id")
    await db.clicks.create_index("user_id")
    await db.clicks.create_index("ip_address")
    await db.clicks.create_index("timestamp")
    await db.clicks.create_index("is_suspicious")
    await db.clicks.create_index([("timestamp", -1)])  # Descending for recent first
    
    # Pools indexes
    await db.pools.create_index("pool_code", unique=True)
    await db.pools.create_index("city_plate_code")
    
    # Pool members indexes
    await db.pool_members.create_index("pool_code")
    await db.pool_members.create_index("user_id")
    await db.pool_members.create_index([("pool_code", 1), ("user_id", 1)], unique=True)
    
    # Blocked IPs indexes
    await db.blocked_ips.create_index("ip_address", unique=True)
    await db.blocked_ips.create_index("blocked_at")
    
    logger.info("Database indexes created successfully!")

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    db_instance.client.close()
    logger.info("MongoDB connection closed.")
