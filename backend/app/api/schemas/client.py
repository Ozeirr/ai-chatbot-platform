from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class ClientBase(BaseModel):
    name: str
    website_url: HttpUrl

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    website_url: Optional[HttpUrl] = None
    is_active: Optional[bool] = None

class ClientInDB(ClientBase):
    id: str
    api_key: str
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True

class Client(ClientInDB):
    pass

class ClientWithStats(Client):
    total_documents: int
    total_sessions: int
    total_messages: int
