from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

from app.database.session import get_db
from app.database.crud import get_client_analytics, save_analytics_snapshot
from app.database.models import Client, ChatSession, ChatMessage
from app.api.deps import get_current_client

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/summary")
async def get_analytics_summary(
    days: Optional[int] = Query(30, description="Number of days to include in summary"), 
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """
    Get analytics summary for the dashboard.
    """
    try:
        analytics = get_client_analytics(db=db, client_id=current_client.id, days=days)
        return analytics
    except Exception as e:
        logger.error(f"Error in analytics summary: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating analytics summary: {str(e)}"
        )

@router.get("/sessions/daily")
def get_daily_sessions(
    days: int = 30,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Get daily session counts for the specified number of days."""
    date_from = datetime.utcnow() - timedelta(days=days)
    
    # Query to get daily session counts
    daily_sessions = []
    current_date = date_from
    
    while current_date <= datetime.utcnow():
        next_date = current_date + timedelta(days=1)
        
        # Count sessions for this day
        session_count = db.query(ChatSession).filter(
            ChatSession.client_id == current_client.id,
            ChatSession.start_time >= current_date,
            ChatSession.start_time < next_date
        ).count()
        
        daily_sessions.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "count": session_count
        })
        
        current_date = next_date
    
    return daily_sessions

@router.get("/messages/daily")
def get_daily_messages(
    days: int = 30,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Get daily message counts for the specified number of days."""
    date_from = datetime.utcnow() - timedelta(days=days)
    
    # Query to get daily message counts
    daily_messages = []
    current_date = date_from
    
    while current_date <= datetime.utcnow():
        next_date = current_date + timedelta(days=1)
        
        # Count messages for this day
        message_count = db.query(ChatMessage).filter(
            ChatMessage.client_id == current_client.id,
            ChatMessage.created_at >= current_date,
            ChatMessage.created_at < next_date
        ).count()
        
        daily_messages.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "count": message_count
        })
        
        current_date = next_date
    
    return daily_messages

@router.post("/snapshot")
def create_analytics_snapshot(
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Create a snapshot of current analytics."""
    snapshot = save_analytics_snapshot(db=db, client_id=current_client.id)
    return {"message": "Analytics snapshot created successfully"}
