from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ...core import security
from ...api.deps import (
    check_admin,
    get_session,
    get_current_user
)
from ... import models, schemas



router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# Create user (public endpoint)
@router.post("/", response_model=schemas.UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, session: Session = Depends(get_session)):
    # Check if user with same email or username already exists
    existing_user = session.exec(
        select(models.User).where(
            (models.User.email == user.email) | 
            (models.User.username == user.username)
        )
    ).first()
    
    if existing_user:
        if existing_user.email == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="User with this username already exists"
            )

    # Hashing the password 
    user.password = security.hash_password(user.password)
    
    new_user = models.User(**user.model_dump())
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

# Admin only endpoints

# Get a user based on Id
@router.get("/{user_id}", response_model=schemas.UserPublic)
def get_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user)
    ):
    check_admin(current_user)
    user = session.get(models.User, user_id) 
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    return user

# List all users
@router.get("/", response_model=List[schemas.UserPublic])
def list_users(
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user)
):
    check_admin(current_user)
    users = session.exec(select(models.User)).all()
    return users

# Delete user (admin only)
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user)
):
    check_admin(current_user)
    user = session.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot delete their own account"
        )
    
    session.delete(user)
    session.commit()
    return None

# Update user role (admin only)
@router.patch("/{user_id}/role", response_model=schemas.UserPublic)
def update_user_role(
    user_id: int,
    role_update: schemas.RoleUpdate,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user)
):
    check_admin(current_user)
    user = session.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.user_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot modify their own role"
        )
    
    user.role = role_update.role
    session.add(user)
    session.commit()
    session.refresh(user)
    return user