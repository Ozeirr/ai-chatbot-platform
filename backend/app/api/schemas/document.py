from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any
from datetime import datetime

class DocumentBase(BaseModel):
    title: str
    content: str
    url: Optional[HttpUrl] = None
    metadata: Optional[Dict[str, Any]] = {}

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    url: Optional[HttpUrl] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentInDB(DocumentBase):
    id: str
    client_id: str
    created_at: datetime
    vector_id: Optional[str] = None

    class Config:
        orm_mode = True

class Document(DocumentInDB):
    pass
