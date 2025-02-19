import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

from app.models import User, Category, Business, Review

# Load environment variables from .env file
load_dotenv()

# Get the database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# database engine
engine = create_engine(DATABASE_URL, echo=True)

def create_tables():
    """Create tables associated with sqlmodel metadata e.g. models that have table=True"""
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
    
if __name__ == "__main__":
    create_tables()