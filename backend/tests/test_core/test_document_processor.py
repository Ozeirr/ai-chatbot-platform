import pytest
from app.core.document_processor import DocumentProcessor

def test_process_document():
    # Create processor
    processor = DocumentProcessor(chunk_size=100, chunk_overlap=20)
    
    # Test document
    document = {
        "id": "test-123",
        "title": "Test Document",
        "content": "This is a test document. " * 15,  # Create content that will be split into chunks
        "url": "https://test.com/doc"
    }
    
    # Process document
    chunks = processor.process_document(document, client_id="client-123")
    
    # Validate results
    assert len(chunks) > 1  # Should be split into multiple chunks
    
    # Check first chunk
    assert chunks[0]["title"] == "Test Document"
    assert chunks[0]["client_id"] == "client-123"
    assert "content" in chunks[0]
    assert len(chunks[0]["content"]) <= 100 + 20  # chunk_size + overlap
    
    # Check metadata
    assert chunks[0]["metadata"]["document_id"] == "test-123"
    assert chunks[0]["metadata"]["client_id"] == "client-123"
    assert chunks[0]["metadata"]["title"] == "Test Document"
