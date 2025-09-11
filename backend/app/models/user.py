from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from pydantic import EmailStr
import uuid
from .base import BaseUUIDModel

if TYPE_CHECKING:
    from .recipe import Recipe, RecipeRead

class User(BaseUUIDModel, table=True):
    email: EmailStr = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    recipes: List["Recipe"] = Relationship(back_populates="owner")


class UserCreate(SQLModel):
    email: EmailStr
    password: str


class UserRead(SQLModel):
    id: uuid.UUID
    email: EmailStr
    is_active: bool
    is_superuser: bool

class UserReadWithRecipes(UserRead):
    recipes: List["RecipeRead"] = []


class UserUpdate(SQLModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
