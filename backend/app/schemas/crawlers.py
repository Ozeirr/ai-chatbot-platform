from enum import Enum
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class CrawlerStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class CrawlerBase(BaseModel):
    url: str


class CrawlerCreate(CrawlerBase):
    client_id: UUID


class CrawlerResponse(CrawlerBase):
    id: UUID
    client_id: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    result_data: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True
