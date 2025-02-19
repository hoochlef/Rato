from datetime import datetime
from sqlmodel import TIMESTAMP, Column, Field
from sqlalchemy import CheckConstraint, func
from .schemas import BusinessBase, ReviewBase, UserBase, CategoryBase


# Models
class Business(BusinessBase, table=True):
    __tablename__ = "businesses"
    business_id: int | None = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="categories.category_id", nullable=False)
    created_at: datetime = Field(sa_column=Column(TIMESTAMP(timezone=False), server_default=func.now()))

class Review(ReviewBase, table=True):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint('rating BETWEEN 1 AND 5', name='check_rating_range'),
    )
    user_id: int = Field(foreign_key="users.user_id", nullable=False)
    business_id: int = Field(foreign_key="businesses.business_id", nullable=False)
    review_id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(sa_column=Column(TIMESTAMP(timezone=False), server_default=func.now()))

class User(UserBase, table=True):
    __tablename__ = "users"
    user_id: int | None = Field(default=None, primary_key=True)
    hashed_password: str = Field(nullable=False)
    created_at: datetime = Field(sa_column=Column(TIMESTAMP(timezone=False), server_default=func.now()))

class Category(CategoryBase, table=True):
    __tablename__ = "categories"
    category_id: int | None = Field(default=None, primary_key=True)


