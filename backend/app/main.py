from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn

from app.core.config import settings
from app.api.routes import clients, documents, chat, analytics

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s %(levelname)s:%(name)s:%(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

app = FastAPI(title="AI Chatbot Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "AI Chatbot Platform API is running"}

if __name__ == "__main__":
    """
    Run the application directly using Uvicorn when this script is executed.
    
    Example:
        python -m app.main
    """
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )
