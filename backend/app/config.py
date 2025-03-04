import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./chatbot.db")
    
    # API settings
    API_PREFIX: str = "/api"
    
    # OpenAI settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Pinecone settings
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "chatbot-knowledge")
    
    # Dimension for embeddings - set to 1024 to match existing Pinecone index
    # Options: 1536 (OpenAI) or 1024 (HuggingFace)
    EMBEDDINGS_DIMENSION: int = int(os.getenv("EMBEDDINGS_DIMENSION", "1024"))
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Crawler settings
    MAX_PAGES_PER_CRAWL: int = 50

settings = Settings()
