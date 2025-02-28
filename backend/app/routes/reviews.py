from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from ..core import oauth2
from .. import models, schemas
from ..core.database import get_session


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

@router.get("/{business_id}", response_model=list[schemas.ReviewPublicWithVote])
def get_reviews(business_id: int, session: Session = Depends(get_session),
                    offset: int = 0,
                    limit: int = 20):
    votes_count = func.count(models.ReviewVote.review_id).label("votes_count")
    reviews = session.exec(
        select(models.Review, votes_count)
        .join(models.ReviewVote, models.Review.review_id == models.ReviewVote.review_id, isouter=True)
        .where(models.Review.business_id == business_id)
        .limit(limit)
        .offset(offset)
        .group_by(models.Review.review_id)
        .order_by(votes_count.desc())
    ).all()

    if not reviews:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No reviews assigned to that business")
    return reviews

    
# Add a review to a business
@router.post("/{business_id}", response_model=schemas.ReviewPublic)
def add_review(business_id: int, review: schemas.ReviewCreate, session: Session = Depends(get_session),
                    current_user: models.User = Depends(oauth2.get_current_user)):
    db_business = session.get(models.Business, business_id)
    if not db_business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    
    db_review = models.Review(user_id=current_user.user_id, business_id=business_id, **review.model_dump())
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review

# Delete a review
@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, session: Session = Depends(get_session),
                    current_user: models.User = Depends(oauth2.get_current_user)):
    review = session.get(models.Review, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    if review.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to do this action")
    
    session.delete(review)
    session.commit()

# Update a review
@router.patch("/{review_id}", response_model=schemas.ReviewPublic)
def update_review(review_id: int, review: schemas.ReviewUpdate, session: Session = Depends(get_session),
                    current_user: models.User = Depends(oauth2.get_current_user)):
    db_review = session.get(models.Review, review_id)
    if not db_review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    if db_review.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to do this action")

    review_data = review.model_dump(exclude_unset=True)
    
    for key, value in review_data.items():
        setattr(db_review, key, value)

    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review