from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
import uuid

from app.database.session import get_db
from app.database.crud import get_client_by_api_key

def generate_api_key():
    """Generate a new API key."""
    return str(uuid.uuid4())

def get_client_by_api_key_util(db: Session, api_key: str):
    """Get a client by API key."""
    client = get_client_by_api_key(db, api_key)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return client
