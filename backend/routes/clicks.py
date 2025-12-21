from fastapi import APIRouter, HTTPException, Depends, Query
from models.click import Click, ClickCreate, ClickAnalytics
from routes.auth import get_user_from_token
from database import get_database
from services.fraud_detector import fraud_detector
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/clicks", tags=["Clicks"])

@router.post("/track")
async def track_click(click_data: ClickCreate, user = Depends(get_user_from_token)):
    """
    Tıklama tracking endpoint - GERÇEK ZAMANLI ANALİZ
    Bu endpoint Google Ads'den gelen tıklamaları yakalar ve analiz eder
    """
    db = await get_database()
    
    # Kampanya kontrolü
    campaign = await db.campaigns.find_one({
        "id": click_data.campaign_id,
        "user_id": user['id']
    })
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # FRAUD DETECTOR - Ana motor!
    result = await fraud_detector.process_click(
        db,
        click_data.model_dump(),
        user['id']
    )
    
    logger.info(f"Click tracked: {result['status']} - fraud_score: {result['fraud_score']}")
    
    return result

@router.get("", response_model=List[Click])
async def get_clicks(
    campaign_id: Optional[str] = None,
    is_suspicious: Optional[bool] = None,
    limit: int = Query(50, le=500),
    skip: int = 0,
    user = Depends(get_user_from_token)
):
    """Tıklamaları listele (filtrelenebilir)"""
    db = await get_database()
    
    query = {"user_id": user['id']}
    
    if campaign_id:
        query["campaign_id"] = campaign_id
    
    if is_suspicious is not None:
        query["is_suspicious"] = is_suspicious
    
    clicks = await db.clicks.find(query, {"_id": 0}) \
        .sort("timestamp", -1) \
        .skip(skip) \
        .limit(limit) \
        .to_list(None)
    
    return clicks

@router.get("/analytics", response_model=ClickAnalytics)
async def get_click_analytics(
    campaign_id: Optional[str] = None,
    user = Depends(get_user_from_token)
):
    """Tıklama analitics"""
    db = await get_database()
    
    from services.click_analyzer import click_analyzer
    
    stats = await click_analyzer.get_click_statistics(
        db,
        user_id=user['id'],
        campaign_id=campaign_id
    )
    
    # Şehir bazlı analiz
    query = {"user_id": user['id']}
    if campaign_id:
        query["campaign_id"] = campaign_id
    
    city_pipeline = [
        {"$match": query},
        {"$group": {"_id": "$location_city", "count": {"$sum": 1}}}
    ]
    city_stats = await db.clicks.aggregate(city_pipeline).to_list(None)
    cities = {item["_id"]: item["count"] for item in city_stats if item["_id"]}
    
    # Ortalama fraud score
    fraud_pipeline = [
        {"$match": query},
        {"$group": {"_id": None, "avg_score": {"$avg": "$fraud_score"}}}
    ]
    fraud_avg = await db.clicks.aggregate(fraud_pipeline).to_list(None)
    avg_fraud_score = fraud_avg[0]["avg_score"] if fraud_avg else 0
    
    return ClickAnalytics(
        total_clicks=stats['total_clicks'],
        suspicious_clicks=stats['suspicious_clicks'],
        blocked_clicks=stats['blocked_clicks'],
        clicks_by_device=stats['devices'],
        clicks_by_city=cities,
        fraud_score_avg=round(avg_fraud_score, 2)
    )
