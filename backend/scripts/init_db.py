from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database
import os
import sys

# Add parent directory to path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import engine
from app.database.models import Base
from app.config import settings

def init_database():
    """Initialize the database schema."""
    # Create database if it doesn't exist
    if not database_exists(engine.url):
        create_database(engine.url)
        print(f"Created database at {engine.url}")
    
    # Create tables
    Base.metadata.create_all(engine)
    print("Created database tables")
    
    # Create session factory
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

if __name__ == "__main__":
    # Initialize the database
    session = init_database()
    session.close()
    print("Database initialization complete")
