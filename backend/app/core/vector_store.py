import os
from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Any, Optional
from langchain_openai import OpenAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore 
import logging

from app.config import settings

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, index_name: str = None):
        self.index_name = index_name or settings.PINECONE_INDEX_NAME
        
        # Check if we should use OpenAI or HuggingFace embeddings
        if settings.EMBEDDINGS_DIMENSION == 1536:
            self.embeddings = OpenAIEmbeddings(
                model="text-embedding-ada-002", 
                openai_api_key=settings.OPENAI_API_KEY
            )
            self.dimension = 1536
        else:
            # Use HuggingFace embeddings for 1024 dimensions (to match existing index)
            self.embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-en-v1.5")
            self.dimension = 1024
        
        # Initialize Pinecone client
        self.pc = Pinecone(
            api_key=settings.PINECONE_API_KEY
        )
        
        # Get or create index
        if settings.PINECONE_INDEX_NAME not in self.pc.list_indexes().names():
            logger.info(f"Creating new Pinecone index with dimension {self.dimension}")
            self.pc.create_index(
                name=settings.PINECONE_INDEX_NAME,
                dimension=self.dimension,  # Use the dimension matching our embeddings
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
        else:
            # Index exists - verify dimensions match our embeddings
            self._verify_dimensions()
        
        # Connect to the index
        self.index = self.pc.Index(settings.PINECONE_INDEX_NAME)
        
    def _verify_dimensions(self):
        """Verify that the index dimensions match our embeddings dimensions"""
        try:
            index_info = self.pc.describe_index(self.index_name)
            index_dimension = getattr(index_info, 'dimension', None)
            if index_dimension and index_dimension != self.dimension:
                logger.warning(
                    f"Dimension mismatch! Index dimension: {index_dimension}, "
                    f"Embeddings dimension: {self.dimension}. "
                    f"Using embeddings to match index dimension."
                )
                
                # Switch to embeddings that match the index dimension
                if index_dimension == 1024:
                    self.embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-en-v1.5")
                elif index_dimension == 1536:
                    self.embeddings = OpenAIEmbeddings(
                        model="text-embedding-ada-002",
                        openai_api_key=settings.OPENAI_API_KEY
                    )
                self.dimension = index_dimension
        except Exception as e:
            logger.error(f"Error verifying index dimensions: {e}")

    def add_texts(
        self, 
        texts: List[str], 
        metadatas: Optional[List[Dict[str, Any]]] = None, 
        client_id: Optional[str] = None,
        namespace: Optional[str] = None
    ):
        """Add texts to the vector store with optional metadata."""
        if client_id and not namespace:
            namespace = client_id  # Use client_id as namespace for isolation
            
        try:
            vector_store = PineconeVectorStore.from_texts(
                texts=texts, 
                embedding=self.embeddings, 
                index_name=self.index_name,
                metadatas=metadatas,
                namespace=namespace
            )
            return vector_store
        except Exception as e:
            logger.error(f"Error adding texts to vector store: {e}")
            raise e
    
    def similarity_search(
        self, 
        query: str, 
        client_id: Optional[str] = None, 
        top_k: int = 5
    ):
        """Search for similar documents to the query."""
        namespace = client_id if client_id else None
        
        vector_store = PineconeVectorStore.from_existing_index(
            index_name=self.index_name,
            embedding=self.embeddings,
            namespace=namespace
        )
        
        return vector_store.similarity_search(query, k=top_k)
    
    def delete_by_client(self, client_id: str):
        """Delete all vectors for a client."""
        try:
            self.index.delete(
                namespace=client_id,
                delete_all=True
            )
            return True
        except Exception as e:
            print(f"Error deleting vectors for client {client_id}: {e}")
            return False