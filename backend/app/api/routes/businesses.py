from fastapi import Depends, HTTPException, status, APIRouter
from sqlmodel import Session, select

from ... import models, schemas
from sqlalchemy import func

from ...api.deps import (
    get_session,
    get_current_user
)

router = APIRouter(
    prefix="/businesses",
    tags=["Businesses"]
)



@router.get("/", response_model=list[schemas.BusinessWithReviewCount])
def get_businesses(session: Session = Depends(get_session),
                   offset: int = 0,
                   limit: int = 100,
                   search: str | None = ""):
    query = select(models.Business)

    if search:
        query = query.where(func.lower(models.Business.name).contains(search.lower()))

    businesses = session.exec(query.limit(limit).offset(offset)).all()
    
    # Create response with review count for each business
    result = []
    for business in businesses:
        review_count = session.exec(
            select(func.count(models.Review.review_id))
            .where(models.Review.business_id == business.business_id)
        ).first() or 0
        
        result.append({
            "business": business,
            "reviews_count": review_count
        })
    
    return result


# Get businesses by category
@router.get("/category/{category_id}", response_model=list[schemas.BusinessWithReviewCount])
def get_businesses_by_category(
    category_id: int,
    session: Session = Depends(get_session),
    limit: int = 100,
    offset: int = 0
):
    # Check if category exists
    category = session.get(models.Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    # Get businesses by category
    businesses = session.exec(
        select(models.Business)
        .where(models.Business.category_id == category_id)
        .limit(limit)
        .offset(offset)
    ).all()
    
    # Create response with review count for each business
    result = []
    for business in businesses:
        review_count = session.exec(
            select(func.count(models.Review.review_id))
            .where(models.Review.business_id == business.business_id)
        ).first() or 0
        
        result.append({
            "business": business,
            "reviews_count": review_count
        })
    
    return result

# Get an individual business
@router.get("/{business_id}", response_model=schemas.BusinessWithReviewCount)
def get_business(business_id: int, session: Session = Depends(get_session)):
    business = session.get(models.Business, business_id) 
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    
    # Get review count for the business
    review_count = session.exec(
        select(func.count(models.Review.review_id))
        .where(models.Review.business_id == business.business_id)
    ).first() or 0
    
    # Create response with business and review count
    result = {
        "business": business,
        "reviews_count": review_count
    }
    
    return result

# Create a business
@router.post("/", response_model=schemas.BusinessWithReviewCount, status_code=status.HTTP_201_CREATED)
def create_business(business: schemas.BusinessCreate, session: Session = Depends(get_session),
                    current_user: models.User = Depends(get_current_user)):

    # Check if the category exists
    db_category = session.get(models.Category, business.category_id)  
    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    db_business = models.Business(**business.model_dump())
    session.add(db_business)
    session.commit()
    session.refresh(db_business)
    
    # New business has no reviews yet
    result = {
        "business": db_business,
        "reviews_count": 0
    }
    
    return result

# Delete a business
@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business(business_id: int, session: Session = Depends(get_session),
                    current_user: models.User = Depends(get_current_user)):
    
    business = session.get(models.Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    session.delete(business)
    session.commit()

# Update a business
@router.patch("/{business_id}", response_model=schemas.BusinessWithReviewCount)
def update_business(business_id: int, business: schemas.BusinessUpdate, session: Session = Depends(get_session),
                    current_user: models.User = Depends(get_current_user)):
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
    
    # Get review count for the business
    review_count = session.exec(
        select(func.count(models.Review.review_id))
        .where(models.Review.business_id == db_business.business_id)
    ).first() or 0
    
    # Create response with business and review count
    result = {
        "business": db_business,
        "reviews_count": review_count
    }
    
    return result

# Search for businesses by name
@router.get("/search/", response_model=list[schemas.BusinessWithReviewCount])
def search_businesses(name: str, session: Session = Depends(get_session)):
    businesses = session.exec(select(models.Business).where(models.Business.name.contains(name))).all()
    if not businesses:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No businesses found")
    
    # Create response with review count for each business
    result = []
    for business in businesses:
        review_count = session.exec(
            select(func.count(models.Review.review_id))
            .where(models.Review.business_id == business.business_id)
        ).first() or 0
        
        result.append({
            "business": business,
            "reviews_count": review_count
        })
    
    return result