from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.database.crud import (
    create_client, get_client, get_clients, update_client, delete_client
)
from app.api.schemas.client import (
    Client, ClientCreate, ClientUpdate
)
from app.api.deps import get_current_client

router = APIRouter()

@router.post("/", response_model=Client, status_code=status.HTTP_201_CREATED)
def create_new_client(
    client: ClientCreate,
    db: Session = Depends(get_db)
):
    """Create a new client."""
    return create_client(db=db, client=client)

@router.get("/", response_model=List[Client])
def read_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all clients."""
    clients = get_clients(db, skip=skip, limit=limit)
    return clients

@router.get("/me", response_model=Client)
def read_client_me(
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Get current client information."""
    return current_client

@router.get("/{client_id}", response_model=Client)
def read_client(
    client_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific client by ID."""
    db_client = get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@router.put("/{client_id}", response_model=Client)
def update_client_info(
    client_id: str,
    client: ClientUpdate,
    db: Session = Depends(get_db)
):
    """Update a client."""
    db_client = get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return update_client(db=db, client_id=client_id, client=client)

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client_by_id(
    client_id: str,
    db: Session = Depends(get_db)
):
    """Delete a client."""
    db_client = get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    success = delete_client(db=db, client_id=client_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete client")
    return None
