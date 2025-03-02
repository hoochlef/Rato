import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.main import api_router
from .core.config import settings

from alembic import command
from alembic.config import Config

log = logging.getLogger("uvicorn")

# Add this function to run migrations
def run_migrations():
    alembic_cfg = Config(os.path.join(os.path.dirname(__file__), '../alembic.ini'))
    command.upgrade(alembic_cfg, "head")

@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Running migrations at startup...")
    run_migrations()
    yield
    log.info("Application shutdown...")


app = FastAPI(lifespan=lifespan)

# Include the routes
app.include_router(api_router)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get('/')
def root():
    return {"message": "Access /docs to see the API documentation"}