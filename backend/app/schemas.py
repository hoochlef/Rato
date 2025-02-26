from datetime import datetime
from typing import Literal
from sqlmodel import Column, Field, Float, SQLModel
from pydantic import BaseModel, EmailStr


# User classes
class UserBase(SQLModel):
    username: str = Field(unique=True, nullable=False)
    email: EmailStr
    
class UserCreate(UserBase):
    password: str = Field(nullable=False)

class UserPublic(UserBase):
    user_id: int

class UserLogin(SQLModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int | None = None


# Business classes
class BusinessBase(SQLModel):
    name: str = Field(unique=True, nullable=False)
    description: str | None = None
    average_rating: float = Field(default=0.0, sa_column=Column(Float, server_default="0.0"))

class BusinessPublic(BusinessBase):
    business_id: int

class BusinessCreate(BusinessBase):
    category_id: int

class BusinessUpdate(BusinessBase):
    category_id: int | None = None
    name: str | None = None
    description: str | None = None
    average_rating: float | None = None

# Review classes
class ReviewBase(SQLModel):
    rating: float = Field(nullable=False)
    review_text: str = Field(nullable=False)

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(ReviewBase):
    rating: float | None = None
    review_text: str | None = None

class ReviewPublic(ReviewBase):
    review_id: int
    user_id: int
    created_at: datetime
    reviewer: UserBase | None


# Category classes
class CategoryBase(SQLModel):
    name: str = Field(unique=True, nullable=False)
    description: str | None = None

class CategoryCreate(CategoryBase):
    pass

class CategoryPublic(CategoryBase):
    category_id: int

# Vote classes
class Vote(SQLModel):
    review_id: int
    # Direction just means : 0 no vote, 1 vote, in any social media you will click on like (direction=1) and 
    # you can click again to remove it (direction=0)
    direction: Literal[0, 1]