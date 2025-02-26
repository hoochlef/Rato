from fastapi import Depends, HTTPException, status, APIRouter
from sqlmodel import Session, select
from .. import models, schemas, oauth2
from ..database import get_session

router = APIRouter(
    prefix="/vote",
    tags=["Votes"]
)

# Vote "I find this useful on a review"
@router.post("/", status_code=status.HTTP_201_CREATED)
def review_vote(vote: schemas.Vote, session: Session = Depends(get_session),
                current_user: models.User = Depends(oauth2.get_current_user)):
    # Check if the review exists
    review = session.get(models.Review, vote.review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review {vote.review_id} not found")

    vote_query = session.exec(select(models.ReviewVote).where(
        models.ReviewVote.review_id == vote.review_id, models.ReviewVote.user_id == current_user.user_id))
    found_vote = vote_query.first()

    if vote.direction == 1:
        if found_vote:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"User {current_user.user_id} has already voted on review {vote.review_id}")
        new_vote = models.ReviewVote(review_id=vote.review_id, user_id=current_user.user_id)
        session.add(new_vote)
        session.commit()
        return {"State": "Successfully added vote"}
    else:
        if not found_vote:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vote does not exist")
        session.delete(found_vote)
        session.commit()
        return {"State": "Successfully deleted vote"}