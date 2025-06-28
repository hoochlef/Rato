from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, and_

from ... import models, schemas
from ...api.deps import (
    get_session,
    get_current_user
)
from ...schemas import UserRole

router = APIRouter(
    prefix="/review-replies",
    tags=["Review Replies"]
)


# Get reviews for a supervisor's business
@router.get("/supervisor/reviews", response_model=list[schemas.ReviewPublic])
def get_supervisor_reviews(
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user),
    offset: int = 0,
    limit: int = 20
):
    # Check if user is a supervisor
    if current_user.role != UserRole.SUPERVISOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only supervisors can access this endpoint"
        )
    
    # Find businesses where this user is a supervisor
    business = session.exec(
        select(models.Business)
        .where(models.Business.supervisor_id == current_user.user_id)
    ).first()
    
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business assigned to this supervisor"
        )
    
    # Get reviews for the supervisor's business
    reviews = session.exec(
        select(models.Review)
        .where(models.Review.business_id == business.business_id)
        .order_by(models.Review.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return reviews


# Get reviews with their replies for a specific business
@router.get("/business/{business_id}", response_model=list[dict])
def get_reviews_with_replies(
    business_id: int,
    session: Session = Depends(get_session),
    offset: int = 0,
    limit: int = 20
):
    # Check if business exists
    business = session.get(models.Business, business_id)
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    # Get reviews for the business
    reviews = session.exec(
        select(models.Review)
        .where(models.Review.business_id == business_id)
        .order_by(models.Review.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    result = []
    for review in reviews:
        # Get the reply for this review if it exists
        reply = session.exec(
            select(models.ReviewReply)
            .where(models.ReviewReply.review_id == review.review_id)
        ).first()
        
        # Get reviewer information
        reviewer = session.get(models.User, review.user_id)
        
        # Get vote count for this review
        vote_count = session.exec(
            select(models.ReviewVote)
            .where(models.ReviewVote.review_id == review.review_id)
        ).all()
        
        # Create response object
        review_data = {
            "review": {
                "review_id": review.review_id,
                "rating": review.rating,
                "review_title": review.review_title,
                "review_text": review.review_text,
                "user_id": review.user_id,
                "created_at": review.created_at,
                "reviewer": {
                    "username": reviewer.username,
                    "email": reviewer.email,
                    "role": reviewer.role
                } if reviewer else None
            },
            "reply": None,
            "votes_count": len(vote_count)
        }
        
        # Add reply data if it exists
        if reply:
            supervisor = session.get(models.User, reply.supervisor_id)
            review_data["reply"] = {
                "review_reply_id": reply.review_reply_id,
                "reply_text": reply.reply_text,
                "created_at": reply.created_at,
                "supervisor": {
                    "username": supervisor.username,
                    "email": supervisor.email,
                    "role": supervisor.role
                } if supervisor else None
            }
        
        result.append(review_data)
    
    return result


# Create a schema for review reply creation
class ReviewReplyCreate(schemas.SQLModel):
    reply_text: str


# Add a reply to a review
@router.post("/reviews/{review_id}", response_model=dict)
def add_review_reply(
    review_id: int,
    reply: ReviewReplyCreate,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user)
):
    # Check if user is a supervisor
    if current_user.role != UserRole.SUPERVISOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only supervisors can add replies to reviews"
        )
    
    # Check if review exists
    review = session.get(models.Review, review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if supervisor is assigned to the business that owns this review
    business = session.get(models.Business, review.business_id)
    if not business or business.supervisor_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reply to reviews for businesses you supervise"
        )
    
    # Check if a reply already exists
    existing_reply = session.exec(
        select(models.ReviewReply)
        .where(models.ReviewReply.review_id == review_id)
    ).first()
    
    if existing_reply:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A reply already exists for this review"
        )
    
    # Create the reply
    db_reply = models.ReviewReply(
        review_id=review_id,
        supervisor_id=current_user.user_id,
        reply_text=reply.reply_text
    )
    
    session.add(db_reply)
    session.commit()
    session.refresh(db_reply)
    
    # Get supervisor info
    supervisor = session.get(models.User, current_user.user_id)
    
    # Return the reply with supervisor info
    return {
        "review_reply_id": db_reply.review_reply_id,
        "review_id": db_reply.review_id,
        "reply_text": db_reply.reply_text,
        "created_at": db_reply.created_at,
        "supervisor": {
            "username": supervisor.username,
            "email": supervisor.email,
            "role": supervisor.role
        } if supervisor else None
    }


# Update a review reply
@router.patch("/replies/{reply_id}", response_model=dict)
def update_review_reply(
    reply_id: int,
    reply_update: ReviewReplyCreate,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user)
):
    # Check if user is a supervisor
    if current_user.role != UserRole.SUPERVISOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only supervisors can update replies"
        )
    
    # Check if reply exists
    db_reply = session.get(models.ReviewReply, reply_id)
    if not db_reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    # Check if the supervisor is the one who created the reply
    if db_reply.supervisor_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own replies"
        )
    
    # Update the reply
    db_reply.reply_text = reply_update.reply_text
    
    session.add(db_reply)
    session.commit()
    session.refresh(db_reply)
    
    # Get supervisor info
    supervisor = session.get(models.User, current_user.user_id)
    
    # Return the updated reply with supervisor info
    return {
        "review_reply_id": db_reply.review_reply_id,
        "review_id": db_reply.review_id,
        "reply_text": db_reply.reply_text,
        "created_at": db_reply.created_at,
        "supervisor": {
            "username": supervisor.username,
            "email": supervisor.email,
            "role": supervisor.role
        } if supervisor else None
    }


# Delete a review reply
@router.delete("/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review_reply(
    reply_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user)
):
    # Check if user is a supervisor or admin
    if current_user.role != UserRole.SUPERVISOR and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only supervisors or admins can delete replies"
        )
    
    # Check if reply exists
    db_reply = session.get(models.ReviewReply, reply_id)
    if not db_reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )
    
    # If user is a supervisor, check if they own the reply
    if current_user.role == UserRole.SUPERVISOR and db_reply.supervisor_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own replies"
        )
    
    # Delete the reply
    session.delete(db_reply)
    session.commit()
