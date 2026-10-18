from fastapi import APIRouter, Depends
from app.models.schemas import DashboardStatsResponse
from app.routes.auth import get_current_user
from app.db.database import DatabaseManager

router = APIRouter(prefix="/dashboard", tags=["Dashboard Statistics"])

STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024  # 5 GB

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """
    Calculates total files and storage used directly from the authenticated user's
    records in the database.
    """
    user_id = current_user["id"]
    stats = DatabaseManager.get_user_stats(user_id)

    return DashboardStatsResponse(
        total_files=stats["total_files"],
        storage_used_bytes=stats["storage_used_bytes"],
        storage_limit_bytes=STORAGE_QUOTA_BYTES
    )
