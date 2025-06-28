from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from .. import models
from ..schemas import UserRole
from ..core.database import engine
from ..core.security import verify_access_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')


def get_session():
    with Session(engine) as session:
        yield session


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    token_data = verify_access_token(token, credentials_exception)

    user = session.exec(select(models.User).where(models.User.user_id == token_data.user_id)).first()
    if not user:
        raise credentials_exception 

    return user


def check_admin(user: models.User):
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can perform this action"
        )
    return True 

def check_supervisor(user: models.User):
    """Function to check if the current user is a supervisor --- Initially it was created to 
    not give supervisors the ability to submit reviews"""
    if user.role == UserRole.SUPERVISOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Supervisors cannot perform this action"
        )