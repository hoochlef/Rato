from sqlmodel import create_engine
from .config import settings

# # Get the database URL from environment variables
SQLALCHEMY_DATABASE_URL = f'postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}'

# database engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

# This code is commented out now that I switched to a migration tool called Alembic
# So I don't need to manually run this script whenever I need to create tables
# But it's commented out for now, I won't delete it.
# def create_tables():
#     """Create tables associated with sqlmodel metadata e.g. models that have table=True"""
#     SQLModel.metadata.create_all(engine)


# if __name__ == "__main__":
#     create_tables()
    
