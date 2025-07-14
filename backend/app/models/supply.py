from typing import Optional
import uuid
from sqlmodel import SQLModel, Field
from .base import TenantBaseModel


class Supply(TenantBaseModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id")
    name: str
    category: Optional[str] = None
    unit_cost: float = 0
    stock_quantity: Optional[float] = 0


class SupplyCreate(SQLModel):
    user_id: uuid.UUID
    name: str
    category: Optional[str] = None
    unit_cost: float = 0
    stock_quantity: Optional[float] = 0


class SupplyRead(SupplyCreate):
    id: uuid.UUID


class SupplyUpdate(SQLModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit_cost: Optional[float] = None
    stock_quantity: Optional[float] = None
