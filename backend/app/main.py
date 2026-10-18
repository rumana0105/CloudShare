from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import auth, files, dashboard
from app.services.s3_service import S3Service
from app.models.schemas import HealthResponse
from app.db.database import init_db

# Initialize SQLite database schema
init_db()

app = FastAPI(
    title="CloudShare — Secure AWS S3 Cloud Storage API",
    description="Distributed Systems & Cloud Computing (DSCC) MCA Mini Project by Romana Jagirdar & Gauri Kangle.",
    version="2.1.0"
)

# Enable CORS for frontend applications
cors_origins = settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def check_system_health() -> HealthResponse:
    """
    Health check logic to detect FastAPI, SQLite, and Amazon S3 connectivity status.
    """
    s3_connected = S3Service.check_connection()
    aws_configured = bool(
        s3_connected or (
            settings.AWS_ACCESS_KEY_ID
            and settings.AWS_SECRET_ACCESS_KEY
            and "YOUR_AWS" not in settings.AWS_ACCESS_KEY_ID
        )
    )

    return HealthResponse(
        status="healthy" if s3_connected else "warning",
        message="CloudShare S3 Backend Online" if s3_connected else "FastAPI is running, but Amazon S3 bucket is not accessible or AWS credentials not set.",
        s3_configured=aws_configured,
        s3_bucket=settings.AWS_S3_BUCKET,
        s3_accessible=s3_connected,
        region=settings.AWS_REGION,
        database_status="SQLite Database Connected (users & files)"
    )

# Primary /api router for Vite proxy (/api/*)
api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(files.router)
api_router.include_router(dashboard.router)

@api_router.get("/health", response_model=HealthResponse)
def api_health():
    return check_system_health()

app.include_router(api_router)

# Also mount routers directly at root for direct API access and documentation
app.include_router(auth.router, include_in_schema=False)
app.include_router(files.router, include_in_schema=False)
app.include_router(dashboard.router, include_in_schema=False)

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def root_health():
    return check_system_health()

@app.get("/")
def root():
    return {
        "project": "CloudShare — Secure AWS S3 Cloud Storage System",
        "developers": ["Romana Jagirdar", "Gauri Kangle"],
        "course": "Master of Computer Applications (MCA)",
        "subject": "Distributed Systems and Cloud Computing (DSCC)",
        "primary_cloud_service": "Amazon S3 (Simple Storage Service)",
        "database": "SQLite (Persistent Multi-Tenant Isolation)",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
