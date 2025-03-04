from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Boolean, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    website_url = Column(String, nullable=False)
    api_key = Column(String, default=generate_uuid, unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    documents = relationship("Document", back_populates="client", cascade="all, delete")
    chat_sessions = relationship("ChatSession", back_populates="client", cascade="all, delete")
    chat_messages = relationship("ChatMessage", back_populates="client", cascade="all, delete")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    url = Column(String, nullable=True)
    document_metadata = Column(JSON, default={})
    vector_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="documents")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    user_id = Column(String, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    
    # Relationships
    client = relationship("Client", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="chat_messages")
    session = relationship("ChatSession", back_populates="messages")

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    total_sessions = Column(Integer, default=0)
    total_messages = Column(Integer, default=0)
    avg_messages_per_session = Column(Integer, default=0)
    
    # Relationships
    client = relationship("Client")
