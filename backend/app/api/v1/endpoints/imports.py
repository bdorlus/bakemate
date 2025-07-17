from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
    status,
    BackgroundTasks,
)
from uuid import UUID
from pathlib import Path
from sqlmodel import Session

from app.repositories.sqlite_adapter import get_session
from app.auth.dependencies import get_current_active_user
from app.models import ImportJob, ImportState, User
from app.services.import_service import ImportService

router = APIRouter()
UPLOAD_DIR = Path("app_files/imports")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_import(
    *,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    service = ImportService(session=session)
    upload_path = UPLOAD_DIR / file.filename
    with open(upload_path, "wb") as f:
        f.write(await file.read())
    job = await service.create_job(user_id=current_user.id, file_path=upload_path)
    background_tasks.add_task(service.process_job, job.id, upload_path)
    return {"job_id": str(job.id), "status": job.state.value}


@router.get("/{job_id}")
async def get_import_status(
    *,
    session: Session = Depends(get_session),
    job_id: UUID,
    current_user: User = Depends(get_current_active_user),
):
    job = session.get(ImportJob, job_id)
    if not job or job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Job not found"
        )
    return {
        "job_id": str(job.id),
        "status": job.state.value,
        "summary": job.summary,
    }
