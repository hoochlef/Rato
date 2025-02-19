from fastapi import FastAPI

from .database import create_tables
from .routes import router

app = FastAPI()

# Create tables automatically on startup, on_event is deprecated there's another way using
# lifespan events in fastAPI, for now I will stick to creating tables manually
# @app.on_event("startup")
# def on_startup():
#     create_tables()

# Include the routes
app.include_router(router)