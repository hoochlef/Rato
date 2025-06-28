from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, func, select

from ... import models, schemas
from ...api.deps import (
    get_session,
    get_current_user,
    check_supervisor
)
from ...models import User  # Assuming User model has a 'role' attribute

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

def update_business_average_rating(business_id: int, session: Session):
    # Calculate new average rating
    result = session.exec(
        select(func.avg(models.Review.rating))
        .where(models.Review.business_id == business_id)
    ).first()
    
    # Get the business and update its average rating
    business = session.get(models.Business, business_id)
    if business:
        business.average_rating = round(float(result), 1) if result else 0.0
        session.add(business)
        session.commit()


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


@router.get("/admin/all", response_model=list[schemas.ReviewPublicWithVote])
def get_all_reviews_admin(
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
    offset: int = 0,
    limit: int = 50  # Default limit for admin view
):
    if current_user.role != "admin":  # Assuming 'admin' is the role string
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    votes_count = func.count(models.ReviewVote.review_id).label("votes_count")
    reviews_query = (
        select(models.Review, votes_count)
        .join(models.ReviewVote, models.Review.review_id == models.ReviewVote.review_id, isouter=True)
        .limit(limit)
        .offset(offset)
        .group_by(models.Review.review_id)
        .order_by(models.Review.created_at.desc())  # Order by creation date for admin view
    )
    reviews = session.exec(reviews_query).all()

    if not reviews:
        # Return empty list if no reviews, not a 404, as it's a list endpoint
        return []
    return reviews

    
# Add a review to a business
@router.post("/{business_id}", response_model=schemas.ReviewPublic)
def add_review(business_id: int, review: schemas.ReviewCreate, session: Session = Depends(get_session),
                    current_user: models.User = Depends(get_current_user)):
    check_supervisor(current_user)
    db_business = session.get(models.Business, business_id)
    if not db_business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    
    db_review = models.Review(user_id=current_user.user_id, business_id=business_id, **review.model_dump())
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    
    update_business_average_rating(business_id, session)
    
    return db_review

# Delete a review
@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, session: Session = Depends(get_session),
                    current_user: models.User = Depends(get_current_user)):
    review = session.get(models.Review, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    # Allow deletion if user is admin or owns the review
    if review.user_id != current_user.user_id and current_user.role != "admin":  # Assuming 'admin' is the role string
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to do this action")
    
    business_id = review.business_id
    session.delete(review)
    session.commit()
    
    update_business_average_rating(business_id, session)

# Update a review
@router.patch("/{review_id}", response_model=schemas.ReviewPublic)
def update_review(review_id: int, review: schemas.ReviewUpdate, session: Session = Depends(get_session),
                    current_user: models.User = Depends(get_current_user)):
    db_review = session.get(models.Review, review_id)
    if not db_review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    # Allow update if user is admin or owns the review (Admins typically don't edit user reviews, but can if needed)
    # For this example, we keep the original ownership check for updates.
    # If admins should also update any review, add: `and current_user.role != "admin"` to the condition.
    if db_review.user_id != current_user.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to do this action")

    review_data = review.model_dump(exclude_unset=True)
    
    for key, value in review_data.items():
        setattr(db_review, key, value)

    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    
    if 'rating' in review_data:
        update_business_average_rating(db_review.business_id, session)
    
    return db_review