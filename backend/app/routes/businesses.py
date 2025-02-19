from typing import Annotated
from fastapi import Depends, HTTPException, Query, status, APIRouter
from sqlmodel import Session, select
from .. import models, schemas
from ..database import get_session

router = APIRouter()

# Get all businesses
@router.get("/businesses/", response_model=list[schemas.BusinessPublic])
def get_businesses(session: Session = Depends(get_session),
                    offset: int = 0,
                    limit: Annotated[int, Query(le=100)] = 100):
    businesses = session.exec(select(models.Business).offset(offset).limit(limit)).all()
    return businesses

# Get an individual business
@router.get("/businesses/{business_id}", response_model=schemas.BusinessPublic)
def get_business(business_id: int, session: Session = Depends(get_session)):
    business = session.get(models.Business, business_id) 
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    return business

# Create a business
@router.post("/businesses/", response_model=schemas.BusinessPublic, status_code=status.HTTP_201_CREATED)
def create_business(business: schemas.BusinessCreate, session: Session = Depends(get_session)):
    # Check if the category exists
    db_category = session.get(models.Category, business.category_id)  
    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    # db_business = Business(name=business.name, description=business.description, category_id=business.category_id)
    db_business = models.Business(**business.model_dump())
    session.add(db_business)
    session.commit()
    session.refresh(db_business)
    return db_business

# Delete a business
@router.delete("/businesses/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business(business_id: int, session: Session = Depends(get_session)):
    business = session.get(models.Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    session.delete(business)
    session.commit()

# Update a business
@router.patch("/businesses/{business_id}", response_model=schemas.BusinessPublic)
def update_business(business_id: int, business: schemas.BusinessUpdate, session: Session = Depends(get_session)):
    db_business = session.get(models.Business, business_id)
    if not db_business:
        raise HTTPException(status_code=404, detail="Business not found")
    
    business_data = business.model_dump(exclude_unset=True)

    # Check if category_id is present in the request body
    if "category_id" in business_data:
        db_category = session.get(models.Category, business.category_id)  
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
    businesses = session.exec(select(models.Business).where(models.Business.name.contains(name))).all()
    if not businesses:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No businesses found")
    return businesses