from datetime import datetime
from typing import Literal
from enum import Enum
from sqlmodel import Column, Field, Float, SQLModel
from pydantic import BaseModel, EmailStr


# Role enum
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SUPERVISOR = "supervisor"

# User classes
class UserBase(SQLModel):
    username: str = Field(unique=True, nullable=False)
    email: EmailStr
    role: UserRole = Field(default=UserRole.USER)
    
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
    role: UserRole | None = None

class RoleUpdate(SQLModel):
    role: UserRole

# Category classes
class CategoryBase(SQLModel):
    name: str = Field(unique=True, nullable=False)
    description: str | None = None
    icon: str = Field(unique=True, nullable=False)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    name: str | None = None
    description: str | None = None
    icon: str | None = None

class CategoryPublic(CategoryBase):
    category_id: int    

# Business classes
class BusinessBase(SQLModel):
    name: str = Field(unique=True, nullable=False)
    description: str | None = None
    average_rating: float = Field(default=0.0, sa_column=Column(Float, server_default="0.0"))
    location: str = Field(nullable=False)
    logo: str = Field(nullable=False)
    number: str | None = None
    website: str | None = None

class BusinessPublic(BusinessBase):
    business_id: int
    category_id: int
    supervisor_id : int | None = None
    category: CategoryBase | None

class BusinessCreate(BusinessBase):
    category_id: int
    supervisor_id : int | None = None

class BusinessUpdate(BusinessBase):
    category_id: int | None = None
    name: str | None = None
    description: str | None = None
    average_rating: float | None = None
    location: str | None = None
    logo: str | None = None
    number: str | None = None
    website: str | None = None
    supervisor_id : int | None = None

# Review classes
class ReviewBase(SQLModel):
    rating: int = Field(nullable=False, ge=1, le=5)
    review_text: str = Field(nullable=False)
    review_title: str = Field(nullable=False)

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(ReviewBase):
    rating: int | None = None
    review_text: str | None = None
    review_title: str | None = None

class ReviewPublic(ReviewBase):
    review_id: int
    user_id: int
    created_at: datetime
    reviewer: UserBase | None

class ReviewPublicWithVote(SQLModel):
    Review: ReviewPublic
    votes_count: int


# Business with review count
class BusinessWithReviewCount(SQLModel):
    business: BusinessPublic
    reviews_count: int

# Vote classes
class Vote(SQLModel):
    review_id: int
    # Direction just means : 0 no vote, 1 vote, in any social media you will click on like (direction=1) and 
    # you can click again to remove it (direction=0)
    direction: Literal[0, 1]