from fastapi import APIRouter
from app.api.routes import clients, crawlers  # Add crawlers import

api_router = APIRouter()
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(crawlers.router, prefix="/clients", tags=["crawlers"])