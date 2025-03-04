import os
import json
from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    API_PREFIX: str = "/api"
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Database Configuration
    DATABASE_URL: str
    
    # OpenAI Configuration
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4-turbo"
    
    # Pinecone Configuration
    PINECONE_API_KEY: str
    PINECONE_ENVIRONMENT: str
    
    # Embedding Model
    EMBEDDING_MODEL: str = "BAAI/bge-large-en-v1.5"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    @field_validator("CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from string to list if needed."""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v

def get_settings() -> Settings:
    """Get application settings."""
    return Settings()

settings = get_settings()
