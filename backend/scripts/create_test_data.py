import os
import sys
import uuid

# Add parent directory to path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.models import Client, Document
from app.database.session import engine, SessionLocal
from app.core.vector_store import VectorStore
from app.core.document_processor import DocumentProcessor

def create_test_clients(session):
    """Create test clients for development."""
    # Sample clients
    clients = [
        {
            "name": "TechGadgets",
            "website_url": "https://techgadgets-example.com",
            "api_key": str(uuid.uuid4())
        },
        {
            "name": "FoodDelivery",
            "website_url": "https://fooddelivery-example.com",
            "api_key": str(uuid.uuid4())
        }
    ]
    
    created_clients = []
    for client_data in clients:
        # Check if client with same name already exists
        existing = session.query(Client).filter_by(name=client_data["name"]).first()
        if existing:
            print(f"Client '{client_data['name']}' already exists, skipping")
            created_clients.append(existing)
            continue
            
        client = Client(**client_data)
        session.add(client)
        created_clients.append(client)
        print(f"Created client: {client.name} with API key: {client.api_key}")
    
    # Commit to save clients
    session.commit()
    
    return created_clients

def create_sample_documents(session, clients):
    """Create sample documents for testing."""
    # Sample documents for the first client
    tech_docs = [
        {
            "title": "Product Return Policy",
            "content": """
            Return Policy for TechGadgets:
            
            We offer a 30-day return policy for all our products. Items must be in their original packaging and in the same condition as when you received them.
            
            To start a return, please email support@techgadgets-example.com with your order number and reason for return.
            
            Shipping costs for returns are the responsibility of the customer unless the return is due to our error.
            
            Refunds will be processed within 7 business days after we receive the returned item.
            """,
            "url": "https://techgadgets-example.com/returns"
        },
        {
            "title": "Shipping Information",
            "content": """
            Shipping Information for TechGadgets:
            
            Standard Shipping: 3-5 business days
            Express Shipping: 1-2 business days
            
            We ship to all 50 US states and Canada. International shipping is available for select countries.
            
            Orders placed before 2pm EST on business days are processed the same day.
            
            Free shipping on all orders over $50.
            """,
            "url": "https://techgadgets-example.com/shipping"
        }
    ]
    
    # Sample documents for the second client
    food_docs = [
        {
            "title": "Delivery Areas",
            "content": """
            FoodDelivery serves the following areas:
            
            Downtown Metro Area: 15-30 minute delivery
            Suburban Areas: 30-45 minute delivery
            Outlying Regions: 45-60 minute delivery
            
            Check your specific delivery time by entering your address in our app.
            
            We operate from 10am to 10pm, seven days a week.
            """,
            "url": "https://fooddelivery-example.com/areas"
        },
        {
            "title": "FAQ",
            "content": """
            Frequently Asked Questions:
            
            Q: How do I track my order?
            A: You can track your order in real-time through our app or by clicking the link in your confirmation email.
            
            Q: What if my order is late?
            A: We guarantee delivery within the estimated time frame. If your order is late, you'll receive a credit for your next order.
            
            Q: Can I change my order after it's been placed?
            A: You can modify your order within 5 minutes of placing it. After that, please contact customer support.
            """,
            "url": "https://fooddelivery-example.com/faq"
        }
    ]
    
    # Add documents for each client
    if len(clients) >= 1:
        for doc_data in tech_docs:
            doc = Document(client_id=clients[0].id, **doc_data)
            session.add(doc)
            print(f"Added document '{doc.title}' to client {clients[0].name}")
            
    if len(clients) >= 2:
        for doc_data in food_docs:
            doc = Document(client_id=clients[1].id, **doc_data)
            session.add(doc)
            print(f"Added document '{doc.title}' to client {clients[1].name}")
    
    # Commit to save documents
    session.commit()

def process_documents_for_vector_store(session, clients):
    """Process documents and add to vector store."""
    vector_store = VectorStore()
    document_processor = DocumentProcessor()
    
    for client in clients:
        documents = session.query(Document).filter_by(client_id=client.id).all()
        
        for document in documents:
            # Process document
            processed_chunks = document_processor.process_document(
                {
                    "id": document.id,
                    "title": document.title,
                    "content": document.content,
                    "url": document.url
                },
                client.id
            )
            
            # Add to vector store
            texts = [chunk["content"] for chunk in processed_chunks]
            metadatas = [chunk["metadata"] for chunk in processed_chunks]
            
            try:
                vector_store.add_texts(texts, metadatas, client_id=client.id)
                print(f"Added document '{document.title}' to vector store for client {client.name}")
            except Exception as e:
                print(f"Error adding document to vector store: {e}")

if __name__ == "__main__":
    # Create session
    session = SessionLocal()
    
    try:
        # Create test clients
        clients = create_test_clients(session)
        
        # Create sample documents
        create_sample_documents(session, clients)
        
        # Process documents for vector store
        process_documents_for_vector_store(session, clients)
        
        print("Test data creation complete")
    finally:
        session.close()
