from typing import List, Optional
from uuid import UUID
from sqlmodel import Session

from app.models.supply import Supply, SupplyCreate, SupplyUpdate
from app.models.user import User
from app.repositories.sqlite_adapter import SQLiteRepository


class SupplyService:
    def __init__(self, session: Session):
        self.session = session
        self.supply_repo = SQLiteRepository(model=Supply)  # type: ignore

    async def create_supply(
        self, *, supply_in: SupplyCreate, current_user: User
    ) -> Supply:
        if supply_in.user_id != current_user.id:
            pass
        supply = Supply(**supply_in.model_dump())
        self.session.add(supply)
        self.session.commit()
        self.session.refresh(supply)
        return supply

    async def get_supplies_by_user(self, *, current_user: User) -> List[Supply]:
        return await self.supply_repo.get_multi(filters={"user_id": current_user.id})

    async def update_supply(
        self, *, supply_id: UUID, supply_in: SupplyUpdate, current_user: User
    ) -> Optional[Supply]:
        db_supply = await self.supply_repo.get(id=supply_id)
        if not db_supply or db_supply.user_id != current_user.id:
            return None
        updated_supply = await self.supply_repo.update(
            db_obj=db_supply, obj_in=supply_in
        )
        return updated_supply
