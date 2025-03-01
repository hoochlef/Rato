from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session, select

from ... import models, schemas
from ...api.deps import (
    get_session,
    get_current_user
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