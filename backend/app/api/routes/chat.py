from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.database.crud import (
    create_chat_session, get_chat_session, end_chat_session,
    create_chat_message, get_chat_messages_by_session
)
from app.api.schemas.chat import (
    ChatSession, ChatMessage, ChatRequest, ChatResponse
)
from app.database.models import Client
from app.api.deps import get_current_client
from app.core.chatbot import ChatbotEngine
from app.core.vector_store import VectorStore

router = APIRouter()

# Initialize services
vector_store = VectorStore()
chatbot_engine = ChatbotEngine(vector_store)

@router.post("/", response_model=ChatResponse)
def chat(
    chat_request: ChatRequest,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    # Create or get session
    session_id = chat_request.session_id
    if not session_id:
        session = create_chat_session(
            db=db, 
            client_id=current_client.id, 
            user_id=chat_request.user_id
        )
        session_id = session.id
    else:
        session = get_chat_session(db=db, session_id=session_id)
        if not session or session.client_id != current_client.id:
            raise HTTPException(status_code=404, detail="Chat session not found")
    
    # Get client info for context
    client_info = {
        "name": current_client.name,
        "website_url": current_client.website_url
    }
    
    try:
        # Get response from chatbot
        response_text = chatbot_engine.get_response(
            query=chat_request.message,
            client_id=current_client.id,
            client_info=client_info,
            session_id=session_id
        )
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating response: {str(e)}"
        )
    
    # Make sure to use ChatMessageCreate properly
    from app.api.schemas.chat import ChatMessageCreate
    
    # Create a proper ChatMessageCreate object
    chat_message = ChatMessageCreate(
        client_id=current_client.id,
        session_id=session_id,
        user_message=chat_request.message,
        bot_response=response_text
    )
    
    # Store chat message
    create_chat_message(db=db, chat_message=chat_message)
    
    return ChatResponse(message=response_text, session_id=session_id)

@router.get("/sessions/{session_id}", response_model=ChatSession)
def get_session(
    session_id: str,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Get a chat session by ID."""
    session = get_chat_session(db=db, session_id=session_id)
    if not session or session.client_id != current_client.id:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return session

@router.post("/sessions/{session_id}/end", response_model=ChatSession)
def end_session(
    session_id: str,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """End a chat session."""
    session = get_chat_session(db=db, session_id=session_id)
    if not session or session.client_id != current_client.id:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    return end_chat_session(db=db, session_id=session_id)

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessage])
def get_session_messages(
    session_id: str,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Get all messages for a chat session."""
    session = get_chat_session(db=db, session_id=session_id)
    if not session or session.client_id != current_client.id:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    messages = get_chat_messages_by_session(db=db, session_id=session_id)
    return messages
