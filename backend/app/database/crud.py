from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import uuid

from app.database.models import Client, Document, ChatSession, ChatMessage, Analytics
from app.api.schemas import client as client_schemas
from app.api.schemas import document as document_schemas
from app.api.schemas import chat as chat_schemas

# Client CRUD operations
def create_client(db: Session, client: client_schemas.ClientCreate):
    """Create a new client"""
    db_client = Client(
        name=client.name,
        website_url=str(client.website_url) if client.website_url else None,
        api_key=str(uuid.uuid4())
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def get_client(db: Session, client_id: str):
    """Get a client by ID"""
    return db.query(Client).filter(Client.id == client_id).first()

def get_client_by_api_key(db: Session, api_key: str):
    """Get a client by API key"""
    return db.query(Client).filter(Client.api_key == api_key, Client.is_active == True).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100):
    """Get all clients with pagination"""
    return db.query(Client).offset(skip).limit(limit).all()

def update_client(db: Session, client_id: str, client: client_schemas.ClientUpdate):
    """Update a client"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if db_client:
        for key, value in client.dict(exclude_unset=True).items():
            setattr(db_client, key, value)
        db.commit()
        db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: str):
    """Delete a client"""
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if db_client:
        db.delete(db_client)
        db.commit()
        return True
    return False

# Document CRUD operations
def create_document(db: Session, document: document_schemas.DocumentCreate, client_id: str):
    """Create a new document"""
    db_document = Document(
        client_id=client_id,
        title=document.title,
        content=document.content,
        url=document.url,
        metadata=document.metadata
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def get_document(db: Session, document_id: str):
    """Get a document by ID"""
    return db.query(Document).filter(Document.id == document_id).first()

def get_documents_by_client(db: Session, client_id: str, skip: int = 0, limit: int = 100):
    """Get all documents for a client with pagination"""
    return db.query(Document).filter(Document.client_id == client_id).offset(skip).limit(limit).all()

def update_document(db: Session, document_id: str, document: document_schemas.DocumentUpdate):
    """Update a document"""
    db_document = db.query(Document).filter(Document.id == document_id).first()
    if db_document:
        for key, value in document.dict(exclude_unset=True).items():
            setattr(db_document, key, value)
        db.commit()
        db.refresh(db_document)
    return db_document

def delete_document(db: Session, document_id: str):
    """Delete a document"""
    db_document = db.query(Document).filter(Document.id == document_id).first()
    if db_document:
        db.delete(db_document)
        db.commit()
        return True
    return False

# Chat CRUD operations
def create_chat_session(db: Session, client_id: str, user_id: str = None):
    """Create a new chat session"""
    session = ChatSession(
        client_id=client_id,
        user_id=user_id
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_chat_session(db: Session, session_id: str):
    """Get a chat session by ID"""
    return db.query(ChatSession).filter(ChatSession.id == session_id).first()

def end_chat_session(db: Session, session_id: str):
    """End a chat session"""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session:
        session.end_time = datetime.utcnow()
        db.commit()
        db.refresh(session)
    return session

def create_chat_message(db: Session, chat_message: chat_schemas.ChatMessageCreate):
    """Create a new chat message"""
    message = ChatMessage(
        client_id=chat_message.client_id,
        session_id=chat_message.session_id,
        user_message=chat_message.user_message,
        bot_response=chat_message.bot_response
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_chat_messages_by_session(db: Session, session_id: str):
    """Get all chat messages for a session"""
    return db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()

# Analytics CRUD operations
def get_client_analytics(db: Session, client_id: str, days: int = 30):
    """Get analytics for a client for the specified number of days"""
    date_from = datetime.utcnow() - timedelta(days=days)
    
    # Get session count
    session_count = db.query(func.count(ChatSession.id))\
        .filter(ChatSession.client_id == client_id, ChatSession.start_time >= date_from)\
        .scalar()
    
    # Get message count
    message_count = db.query(func.count(ChatMessage.id))\
        .filter(ChatMessage.client_id == client_id, ChatMessage.created_at >= date_from)\
        .scalar()
    
    # Get average messages per session
    avg_messages = 0
    if session_count > 0:
        avg_messages = message_count / session_count
    
    return {
        "client_id": client_id,
        "date_range": f"{date_from.strftime('%Y-%m-%d')} to {datetime.utcnow().strftime('%Y-%m-%d')}",
        "total_sessions": session_count,
        "total_messages": message_count,
        "avg_messages_per_session": round(avg_messages, 2)
    }

def save_analytics_snapshot(db: Session, client_id: str):
    """Save current analytics snapshot"""
    analytics = get_client_analytics(db, client_id, days=1)
    
    snapshot = Analytics(
        client_id=client_id,
        total_sessions=analytics["total_sessions"],
        total_messages=analytics["total_messages"],
        avg_messages_per_session=analytics["avg_messages_per_session"]
    )
    
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot
