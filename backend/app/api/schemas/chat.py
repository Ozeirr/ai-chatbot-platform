from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatSessionBase(BaseModel):
    user_id: Optional[str] = None

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSessionInDB(ChatSessionBase):
    id: str
    client_id: str
    start_time: datetime
    end_time: Optional[datetime] = None

    class Config:
        orm_mode = True

class ChatSession(ChatSessionInDB):
    pass

class ChatMessageBase(BaseModel):
    user_message: str

class ChatMessageCreate(ChatMessageBase):
    client_id: str
    session_id: str
    bot_response: str

class ChatMessageInDB(ChatMessageBase):
    id: str
    client_id: str
    session_id: str
    bot_response: str
    created_at: datetime

    class Config:
        orm_mode = True

class ChatMessage(ChatMessageInDB):
    pass

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    session_id: str
