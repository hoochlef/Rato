from typing import Annotated
from fastapi import APIRouter, HTTPException, Query, status, Depends
from sqlmodel import Session, select
from .models import Business, Review, User, Category
from . import schemas
from .database import engine, get_session
from . import utils

router = APIRouter()

## Businesses endpoints 
# Get all businesses
@router.get("/businesses/", response_model=list[schemas.BusinessPublic])
def get_businesses(session: Session = Depends(get_session),
                    offset: int = 0,
                    limit: Annotated[int, Query(le=100)] = 100):
    businesses = session.exec(select(Business).offset(offset).limit(limit)).all()
    return businesses

# Get an individual business
@router.get("/businesses/{business_id}", response_model=schemas.BusinessPublic)
def get_business(business_id: int, session: Session = Depends(get_session)):
    business = session.get(Business, business_id) 
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    return business

# Create a business
@router.post("/businesses/", response_model=schemas.BusinessPublic, status_code=status.HTTP_201_CREATED)
def create_business(business: schemas.BusinessCreate, session: Session = Depends(get_session)):
    # Check if the category exists
    db_category = session.get(Category, business.category_id)  
    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    # db_business = Business(name=business.name, description=business.description, category_id=business.category_id)
    db_business = Business(**business.model_dump())
    session.add(db_business)
    session.commit()
    session.refresh(db_business)
    return db_business

# Delete a business
@router.delete("/businesses/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business(business_id: int, session: Session = Depends(get_session)):
    business = session.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    session.delete(business)
    session.commit()

# Update a business
@router.patch("/businesses/{business_id}", response_model=schemas.BusinessPublic)
def update_business(business_id: int, business: schemas.BusinessUpdate, session: Session = Depends(get_session)):
    db_business = session.get(Business, business_id)
    if not db_business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    business_data = business.model_dump(exclude_unset=True)

    # Check if category_id is present in the request body
    if "category_id" in business_data:
        db_category = session.get(Category, business.category_id)  
        if not db_category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
   
    db_business.sqlmodel_update(business_data)
    session.add(db_business)
    session.commit()
    session.refresh(db_business)
    return db_business

# Search for businesses by name
@router.get("/businesses/search/", response_model=list[schemas.BusinessPublic])
def search_businesses(name: str, session: Session = Depends(get_session)):
    businesses = session.exec(select(Business).where(Business.name.contains(name))).all()
    if not businesses:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No businesses found")
    return businesses

## Reviews endpoints 
# Get reviews for a business
@router.get("/businesses/{business_id}/reviews/", response_model=list[schemas.ReviewPublic])
def get_reviews(business_id: int, session: Session = Depends(get_session)):
    reviews = session.exec(select(Review).where(Review.business_id == business_id)).all()
    if not reviews:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No reviews assigned to that business")
    return reviews
    
# Add a review to a business
@router.post("/businesses/{business_id}/reviews/", response_model=schemas.ReviewPublic)
def add_review(business_id: int, review: schemas.ReviewCreate, session: Session = Depends(get_session)):
    db_business = session.get(Business, business_id)
    if not db_business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    
    # Check if the user exists
    db_user = session.get(User, review.user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    db_review = Review(user_id=review.user_id, rating=review.rating, review_text=review.review_text, business_id=business_id)
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review

# Delete a review
@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, session: Session = Depends(get_session)):
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    session.delete(review)
    session.commit()

# Update a review
@router.patch("/reviews/{review_id}", response_model=schemas.ReviewPublic)
def update_review(review_id: int, review: schemas.ReviewUpdate, session: Session = Depends(get_session)):
    db_review = session.get(Review, review_id)
    if not db_review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    review_data = review.model_dump(exclude_unset=True)
    
    for key, value in review_data.items():
        setattr(db_review, key, value)

    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review

## Users endpoints
@router.post("/users/", response_model=schemas.UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, session: Session = Depends(get_session)):
    # Hashing the password 
    user.password = utils.hash_password(user.password)

    news_user = User(**user.model_dump())
    session.add(news_user)
    session.commit()
    session.refresh(news_user)
    return news_user

# Get a user based on Id
@router.get("/users/{user_id}", response_model=schemas.UserPublic)
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id) 
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    return user