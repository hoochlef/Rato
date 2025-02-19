from sqlmodel import Column, Field, Float, SQLModel


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
    user_id: int = Field(nullable=False)

class ReviewPublic(ReviewBase):
    review_id: int

# User classes
class UserBase(SQLModel):
    username: str = Field(unique=True, nullable=False)
    email: str = Field(unique=True, nullable=False)
    
class UserCreate(UserBase):
    hashed_password: str = Field(nullable=False)

class UserPublic(UserBase):
    user_id: int

# Category classes
class CategoryBase(SQLModel):
    name: str = Field(unique=True, nullable=False)
    description: str | None = None

class CategoryCreate(CategoryBase):
    pass

class CategoryPublic(CategoryBase):
    category_id: int