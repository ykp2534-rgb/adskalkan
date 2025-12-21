from fastapi import APIRouter, HTTPException, Depends
from models.campaign import Campaign, CampaignCreate, CampaignStats
from routes.auth import get_user_from_token
from database import get_database
from services.click_analyzer import click_analyzer
from typing import List
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.post("", response_model=Campaign)
async def create_campaign(campaign_data: CampaignCreate, user = Depends(get_user_from_token)):
    """Yeni kampanya oluştur"""
    db = await get_database()
    
    campaign = Campaign(
        **campaign_data.model_dump(),
        user_id=user['id']
    )
    
    campaign_dict = campaign.model_dump()
    campaign_dict['created_at'] = campaign_dict['created_at'].isoformat()
    campaign_dict['updated_at'] = campaign_dict['updated_at'].isoformat()
    
    await db.campaigns.insert_one(campaign_dict)
    
    logger.info(f"Campaign created: {campaign.name} for user {user['id']}")
    
    return campaign

@router.get("", response_model=List[Campaign])
async def get_campaigns(user = Depends(get_user_from_token)):
    """Kullanıcının kampanyalarını getir"""
    db = await get_database()
    
    campaigns = await db.campaigns.find({"user_id": user['id']}, {"_id": 0}).to_list(None)
    
    return campaigns

@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(campaign_id: str, user = Depends(get_user_from_token)):
    """Tek bir kampanyayı getir"""
    db = await get_database()
    
    campaign = await db.campaigns.find_one({
        "id": campaign_id,
        "user_id": user['id']
    }, {"_id": 0})
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return campaign

@router.get("/{campaign_id}/stats", response_model=CampaignStats)
async def get_campaign_stats(campaign_id: str, user = Depends(get_user_from_token)):
    """Kampanya istatistikleri"""
    db = await get_database()
    
    # Kampanya kontrolü
    campaign = await db.campaigns.find_one({
        "id": campaign_id,
        "user_id": user['id']
    })
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # İstatistikleri al
    stats = await click_analyzer.get_click_statistics(db, user_id=user['id'], campaign_id=campaign_id)
    
    total_saved = stats['blocked_clicks'] * 2.5  # Ortalama 2.5 TL per click
    
    return CampaignStats(
        total_clicks=stats['total_clicks'],
        suspicious_clicks=stats['suspicious_clicks'],
        blocked_clicks=stats['blocked_clicks'],
        clean_clicks=stats['clean_clicks'],
        fraud_percentage=stats['fraud_percentage'],
        total_saved=round(total_saved, 2)
    )

@router.delete("/{campaign_id}")
async def delete_campaign(campaign_id: str, user = Depends(get_user_from_token)):
    """Kampanyayı sil (soft delete)"""
    db = await get_database()
    
    result = await db.campaigns.update_one(
        {"id": campaign_id, "user_id": user['id']},
        {"$set": {"status": "deleted"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    logger.info(f"Campaign deleted: {campaign_id}")
    
    return {"message": "Campaign deleted successfully"}
