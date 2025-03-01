from fastapi import APIRouter

from .routes import businesses, users, reviews, categories, login, vote
api_router = APIRouter()

api_router.include_router(businesses.router)
api_router.include_router(users.router)
api_router.include_router(reviews.router)
api_router.include_router(categories.router)
api_router.include_router(login.router)
api_router.include_router(vote.router)