from sqlmodel import SQLModel, create_engine, Session
from .config import settings
from app.models import User, Category, Business, Review


# # Get the database URL from environment variables
SQLALCHEMY_DATABASE_URL = f'postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}'

# database engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

def create_tables():
    """Create tables associated with sqlmodel metadata e.g. models that have table=True"""
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
    
if __name__ == "__main__":
    create_tables()