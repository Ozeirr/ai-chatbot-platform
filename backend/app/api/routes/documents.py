from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.database.crud import (
    create_document, get_document, get_documents_by_client,
    update_document, delete_document
)
from app.api.schemas.document import (
    Document as DocumentSchema, DocumentCreate, DocumentUpdate
)
from app.database.models import Client, Document
from app.api.deps import get_current_client
from app.core.document_processor import DocumentProcessor
from app.core.vector_store import VectorStore

router = APIRouter()

import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@router.get("/")
def get_documents(db: Session = Depends(get_db)):
    try:
        # Log attempt to fetch documents
        logger.debug("Attempting to fetch documents from database")
        
        # Fixed code - use the SQLAlchemy Document model instead of Pydantic schema
        documents = db.query(Document).all()
        
        logger.debug(f"Retrieved {len(documents)} documents")
        return documents
    except Exception as e:
        # Log the error
        logger.error(f"Error fetching documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
# Initialize services
document_processor = DocumentProcessor()
vector_store = VectorStore()

def process_document_in_background(document_id: str, client_id: str, db: Session):
    """Process a document in the background and store in vector database."""
    # Get document from database
    db_document = get_document(db, document_id)
    if not db_document:
        print(f"Document {document_id} not found")
        return
    
    # Process the document into chunks
    processed_chunks = document_processor.process_document(
        {
            "id": db_document.id,
            "title": db_document.title,
            "content": db_document.content,
            "url": db_document.url
        },
        client_id
    )
    
    # Store in vector database
    texts = [chunk["content"] for chunk in processed_chunks]
    metadatas = [chunk["metadata"] for chunk in processed_chunks]
    vector_store.add_texts(texts, metadatas, client_id=client_id)
    
    # Update document with vector ID
    db_document.vector_id = f"processed_{document_id}"
    db.commit()

@router.post("/", response_model=DocumentSchema, status_code=status.HTTP_201_CREATED)
def create_new_document(
    document: DocumentCreate,
    background_tasks: BackgroundTasks,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Create a new document for the current client."""
    # Create document in database
    db_document = create_document(db=db, document=document, client_id=current_client.id)
    
    # Process document in background
    background_tasks.add_task(
        process_document_in_background, 
        document_id=db_document.id, 
        client_id=current_client.id,
        db=db
    )
    
    return db_document

@router.get("/", response_model=List[DocumentSchema])
def read_documents(
    skip: int = 0,
    limit: int = 100,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Get all documents for the current client."""
    documents = get_documents_by_client(
        db, client_id=current_client.id, skip=skip, limit=limit
    )
    return documents

@router.get("/{document_id}", response_model=DocumentSchema)
def read_document(
    document_id: str,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Get a specific document by ID."""
    db_document = get_document(db, document_id=document_id)
    if db_document is None or db_document.client_id != current_client.id:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_document

@router.put("/{document_id}", response_model=DocumentSchema)
def update_document_info(
    document_id: str,
    document: DocumentUpdate,
    background_tasks: BackgroundTasks,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Update a document."""
    db_document = get_document(db, document_id=document_id)
    if db_document is None or db_document.client_id != current_client.id:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Update document in database
    updated_document = update_document(db=db, document_id=document_id, document=document)
    
    # If content was updated, reprocess the document
    if document.content:
        background_tasks.add_task(
            process_document_in_background, 
            document_id=document_id, 
            client_id=current_client.id,
            db=db
        )
    
    return updated_document

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document_by_id(
    document_id: str,
    current_client: Client = Depends(get_current_client),
    db: Session = Depends(get_db)
):
    """Delete a document."""
    db_document = get_document(db, document_id=document_id)
    if db_document is None or db_document.client_id != current_client.id:
        raise HTTPException(status_code=404, detail="Document not found")
    
    success = delete_document(db=db, document_id=document_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete document")
    
    # TODO: Remove from vector store as well
    
    return None
