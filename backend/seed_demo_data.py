#!/usr/bin/env python3
"""
Demo data oluşturma scripti
Test için örnek havuzlar ve demo datalar ekler
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_data():
    # MongoDB bağlantısı
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'adskalkan_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🌱 Demo data oluşturuluyor...")
    
    # 1. Demo Havuzlar oluştur
    pools_data = [
        {"pool_code": "34001", "city_plate_code": "34", "sector_code": "001", "sector_name": "Tesisatçı", "member_count": 0, "total_blocked_ips": 0, "created_at": datetime.now(timezone.utc).isoformat(), "is_premium": True},
        {"pool_code": "34002", "city_plate_code": "34", "sector_code": "002", "sector_name": "Kombi Servisi", "member_count": 0, "total_blocked_ips": 0, "created_at": datetime.now(timezone.utc).isoformat(), "is_premium": True},
        {"pool_code": "34003", "city_plate_code": "34", "sector_code": "003", "sector_name": "Elektrikçi", "member_count": 0, "total_blocked_ips": 0, "created_at": datetime.now(timezone.utc).isoformat(), "is_premium": True},
        {"pool_code": "06001", "city_plate_code": "06", "sector_code": "001", "sector_name": "Tesisatçı", "member_count": 0, "total_blocked_ips": 0, "created_at": datetime.now(timezone.utc).isoformat(), "is_premium": True},
        {"pool_code": "06002", "city_plate_code": "06", "sector_code": "002", "sector_name": "Avukat", "member_count": 0, "total_blocked_ips": 0, "created_at": datetime.now(timezone.utc).isoformat(), "is_premium": True},
        {"pool_code": "35001", "city_plate_code": "35", "sector_code": "001", "sector_name": "Emlak Danışmanı", "member_count": 0, "total_blocked_ips": 0, "created_at": datetime.now(timezone.utc).isoformat(), "is_premium": True},
        {"pool_code": "35002", "city_plate_code": "35", "sector_code": "002", "sector_name": "Diş Hekimi", "member_count": 0, "total_blocked_ips": 0, "created_at": datetime.now(timezone.utc).isoformat(), "is_premium": True},
        {"pool_code": "16001", "city_plate_code": "16", "sector_code": "001", "sector_name": "İnşaat Firması", "member_count": 0, "total_blocked_ips": 0, "created_at": datetime.now(timezone.utc).isoformat(), "is_premium": True},
    ]
    
    for pool in pools_data:
        existing = await db.pools.find_one({"pool_code": pool["pool_code"]})
        if not existing:
            await db.pools.insert_one(pool)
            print(f"  ✅ Havuz oluşturuldu: {pool['pool_code']} - {pool['sector_name']}")
        else:
            print(f"  ⏭️  Havuz zaten var: {pool['pool_code']}")
    
    print("\n✨ Demo data başarıyla oluşturuldu!")
    print("\n📊 Oluşturulan Havuzlar:")
    print("  • İstanbul (34): Tesisatçı (34001), Kombi Servisi (34002), Elektrikçi (34003)")
    print("  • Ankara (06): Tesisatçı (06001), Avukat (06002)")
    print("  • İzmir (35): Emlak Danışmanı (35001), Diş Hekimi (35002)")
    print("  • Bursa (16): İnşaat Firması (16001)")
    print("\n🚀 Artık kullanıcılar bu havuzlara katılabilir!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
