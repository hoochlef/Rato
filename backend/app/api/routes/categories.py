from typing import Annotated
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlmodel import Session, select

from ... import models, schemas
from ...api.deps import (
    get_session,
    get_current_user,
    check_admin
)


router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

# Create category
@router.post("/", response_model=schemas.CategoryPublic, status_code=status.HTTP_201_CREATED)
def create_category(category: schemas.CategoryCreate, session: Session = Depends(get_session),
                current_user: models.User = Depends(get_current_user)):
    new_category = models.Category(**category.model_dump())
    session.add(new_category)
    session.commit()
    session.refresh(new_category)
    return new_category

# Get all categories
@router.get("/", response_model=list[schemas.CategoryPublic])
def get_categories(session: Session = Depends(get_session),
                    offset: int = 0,
                    limit: Annotated[int, Query(le=100)] = 100):
    categories = session.exec(select(models.Category).offset(offset).limit(limit)).all()
    return categories

# Update a category
@router.patch("/{category_id}", response_model=schemas.CategoryPublic)
def update_category(
    category_id: int,
    category_update: schemas.CategoryUpdate,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user)
):
    check_admin(current_user)
    db_category = session.get(models.Category, category_id)
    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    category_data = category_update.model_dump(exclude_unset=True)
    for key, value in category_data.items():
        setattr(db_category, key, value)
    
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

# Delete a category
@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    session: Session = Depends(get_session),
    current_user: models.User = Depends(get_current_user)
):
    check_admin(current_user)
    category = session.get(models.Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    session.delete(category)
    session.commit()
    return None