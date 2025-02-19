from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from .. import models, schemas
from ..database import get_session


router = APIRouter()

# Get reviews for a business
@router.get("/businesses/{business_id}/reviews/", response_model=list[schemas.ReviewPublic])
def get_reviews(business_id: int, session: Session = Depends(get_session)):
    reviews = session.exec(select(models.Review).where(models.Review.business_id == business_id)).all()
    if not reviews:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No reviews assigned to that business")
    return reviews
    
# Add a review to a business
@router.post("/businesses/{business_id}/reviews/", response_model=schemas.ReviewPublic)
def add_review(business_id: int, review: schemas.ReviewCreate, session: Session = Depends(get_session)):
    db_business = session.get(models.Business, business_id)
    if not db_business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    
    # Check if the user exists
    db_user = session.get(models.User, review.user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    db_review = models.Review(user_id=review.user_id, rating=review.rating, review_text=review.review_text, business_id=business_id)
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review

# Delete a review
@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, session: Session = Depends(get_session)):
    review = session.get(models.Review, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    session.delete(review)
    session.commit()

# Update a review
@router.patch("/reviews/{review_id}", response_model=schemas.ReviewPublic)
def update_review(review_id: int, review: schemas.ReviewUpdate, session: Session = Depends(get_session)):
    db_review = session.get(models.Review, review_id)
    if not db_review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    review_data = review.model_dump(exclude_unset=True)
    
    for key, value in review_data.items():
        setattr(db_review, key, value)

    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review