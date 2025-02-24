from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from .. import models, schemas, utils
from ..database import get_session


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# Create user
@router.post("/", response_model=schemas.UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, session: Session = Depends(get_session)):
    # Hashing the password 
    user.password = utils.hash_password(user.password)

    new_user = models.User(**user.model_dump())
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

# Get a user based on Id
@router.get("/{user_id}", response_model=schemas.UserPublic)
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(models.User, user_id) 
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    return user