from datetime import datetime
from sqlmodel import TIMESTAMP, Column, Field, Float, ForeignKey, SQLModel
from sqlalchemy import CheckConstraint, func


# Models
class Business(SQLModel, table=True):
    __tablename__ = "businesses"
    business_id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, nullable=False)
    description: str | None = None
    average_rating: float = Field(default=0.0, sa_column=Column(Float, server_default="0.0"))
    category_id: int = Field(foreign_key="categories.category_id", ondelete="CASCADE", nullable=False)
    created_at: datetime = Field(sa_column=Column(TIMESTAMP(timezone=False), server_default=func.now()))

class Review(SQLModel, table=True):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint('rating BETWEEN 1 AND 5', name='check_rating_range'),
    )
    review_id: int | None = Field(default=None, primary_key=True)
    rating: float = Field(nullable=False)
    review_text: str = Field(nullable=False)
    user_id: int = Field(foreign_key="users.user_id", ondelete="CASCADE", nullable=False)
    business_id: int = Field(foreign_key="businesses.business_id", ondelete="CASCADE", nullable=False)
    created_at: datetime = Field(sa_column=Column(TIMESTAMP(timezone=False), server_default=func.now()))

class User(SQLModel, table=True):
    __tablename__ = "users"
    user_id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, nullable=False)
    email: str = Field(unique=True, nullable=False)
    password: str = Field(nullable=False)
    created_at: datetime = Field(sa_column=Column(TIMESTAMP(timezone=False), server_default=func.now()))

class Category(SQLModel, table=True):
    __tablename__ = "categories"
    category_id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, nullable=False)
    description: str | None = None


