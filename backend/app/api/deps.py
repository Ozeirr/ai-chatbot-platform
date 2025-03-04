from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.database.crud import get_client_by_api_key
from app.database.models import Client

def get_current_client(
    api_key: str = Header(..., description="Client API key"),
    db: Session = Depends(get_db)
):
    """Dependency to get the current client from the API key."""
    client = get_client_by_api_key(db, api_key)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return client
