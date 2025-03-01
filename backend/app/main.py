from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.main import api_router
from .core.config import settings

app = FastAPI()

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# from .database import create_tables
# Create tables automatically on startup, on_event is deprecated there's another way using
# lifespan events in fastAPI, for now I will stick to creating tables manually
# @app.on_event("startup")
# def on_startup():
#     create_tables()

# Include the routes
app.include_router(api_router)


@app.get('/')
def root():
    return {"message": "yes"}