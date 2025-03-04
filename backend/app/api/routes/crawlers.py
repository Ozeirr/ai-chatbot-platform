from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime  # Added missing import

from app.api.deps import get_db
from app.database import models
from app.schemas.crawlers import CrawlerCreate, CrawlerResponse, CrawlerStatus
from app.core.crawler import crawl_website  # Import existing crawler function

router = APIRouter()

@router.post("/{client_id}/crawl", response_model=CrawlerResponse)
def initiate_crawl(
    client_id: UUID,
    background_tasks: BackgroundTasks,
    url: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Initiate a crawler job for a specific client.
    Optionally provide a specific URL to crawl, otherwise uses client's website URL.
    """
    # Check if client exists
    client = db.query(models.Client).filter(models.Client.id == str(client_id)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Use provided URL or fall back to client's website URL
    crawl_url = url or str(client.website_url)
    if not crawl_url:
        raise HTTPException(
            status_code=400, 
            detail="No URL provided and client has no website URL"
        )
    
    # Create a new crawler job record
    crawler_job = models.CrawlerJob(
        client_id=str(client_id),
        url=crawl_url,
        status=CrawlerStatus.PENDING.value
    )
    db.add(crawler_job)
    db.commit()
    db.refresh(crawler_job)
    
    # Start the crawler job in the background using the existing crawler function
    background_tasks.add_task(
        process_crawl_job, 
        job_id=crawler_job.id,
        url=crawl_url, 
        db=db
    )
    
    return CrawlerResponse(
        id=crawler_job.id,
        client_id=str(client_id),
        url=crawl_url,
        status=crawler_job.status,
        created_at=crawler_job.created_at
    )

@router.get("/{client_id}/jobs", response_model=List[CrawlerResponse])
def get_client_crawl_jobs(
    client_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all crawler jobs for a specific client."""
    # Check if client exists
    client = db.query(models.Client).filter(models.Client.id == str(client_id)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get all crawler jobs for this client
    jobs = db.query(models.CrawlerJob).filter(
        models.CrawlerJob.client_id == str(client_id)
    ).order_by(models.CrawlerJob.created_at.desc()).all()
    
    return jobs

async def process_crawl_job(job_id: str, url: str, db: Session) -> None:
    """
    Process a crawl job using the existing crawler functionality.
    """
    try:
        # Update status to running
        job = db.query(models.CrawlerJob).filter(models.CrawlerJob.id == job_id).first()
        job.status = CrawlerStatus.RUNNING.value
        db.commit()
        
        # Use the existing crawler function to crawl the website
        result = crawl_website(url)
        
        # Update job with results
        job = db.query(models.CrawlerJob).filter(models.CrawlerJob.id == job_id).first()
        job.status = CrawlerStatus.COMPLETED.value
        job.completed_at = datetime.utcnow()
        job.result_data = result
        db.commit()
        
    except Exception as e:
        # Update job with failure status
        job = db.query(models.CrawlerJob).filter(models.CrawlerJob.id == job_id).first()
        job.status = CrawlerStatus.FAILED.value
        job.completed_at = datetime.utcnow()
        job.result_data = {"error": str(e)}
        db.commit()
