from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import init_db
from app.api import auth, reels, courses, playlists, progress, comments, ai

# Initialize database tables on startup
init_db()

# Create FastAPI app
app = FastAPI(
    title="EduBit API",
    description="Bite-sized learning platform API - Instagram Reels meets Udemy",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(reels.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(playlists.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(comments.router, prefix="/api")
app.include_router(ai.router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to EduBit API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
