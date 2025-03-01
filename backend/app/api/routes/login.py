from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from ...core import security
from ... import models, schemas
from ...api.deps import (
    get_session
)



router = APIRouter(
    tags=["Authentication"]
)

@router.post('/login', response_model = schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(models.User).where(models.User.email == user_credentials.username)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email or Password is wrong")
    
    if not security.verify_password(user_credentials.password, user.password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email or Password is wrong")
    
    access_token = security.create_access_token(data = {
        "user_id": user.user_id,
        "role": user.role
    })

    return {"access_token": access_token, "token_type": "bearer"}