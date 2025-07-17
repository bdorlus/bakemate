from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime
import uuid
from sqlalchemy import Column, JSON
from sqlmodel import SQLModel, Field
from .base import BaseUUIDModel


class ImportState(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ImportJob(BaseUUIDModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id")
    state: ImportState = Field(default=ImportState.QUEUED)
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    summary: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
