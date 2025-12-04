from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, Reel
from app.schemas import ReelCreate, ReelResponse, ReelUploadResponse, FeedRequest
from app.api.auth import get_current_user
from app.services.feed_service import feed_service
from app.services.cloudinary_service import cloudinary_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/reels", tags=["Reels"])

@router.post("/upload", response_model=ReelUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_reel(
    file: UploadFile = File(..., description="Video file (.mp4, .mov, etc.)"),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    difficulty_level: str = Form("beginner"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a new reel video to Cloudinary and generate AI metadata
    - Accepts multipart/form-data with video file
    - Uploads to Cloudinary
    - Generates AI summary and quiz
    - Saves to database
    """
    if current_user.role != "creator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can upload reels"
        )
    
    # Upload video to Cloudinary
    upload_result = await cloudinary_service.upload_video(file)
    
    # Create reel in database
    new_reel = Reel(
        title=title,
        description=description or "",
        video_url=upload_result["secure_url"],
        cloudinary_public_id=upload_result["public_id"],
        tags=tags or "",
        difficulty_level=difficulty_level,
        duration_seconds=int(upload_result.get("duration", 60)),
        creator_id=current_user.id
    )
    
    db.add(new_reel)
    db.commit()
    db.refresh(new_reel)
    
    # Generate AI metadata asynchronously (or sync for simplicity)
    try:
        summary_data = ai_service.generate_summary(
            title=title,
            description=description or "",
            tags=tags or "",
            difficulty=difficulty_level
        )
        
        new_reel.ai_summary = summary_data.get("summary")
        new_reel.ai_key_points = summary_data.get("key_points")
        
        quiz_data = ai_service.generate_quiz(
            title=title,
            description=description or "",
            tags=tags or "",
            num_questions=3
        )
        
        new_reel.ai_quiz = quiz_data
        
        db.commit()
        db.refresh(new_reel)
    except Exception as e:
        print(f"AI generation error: {e}")
        # Continue without AI metadata
    
    # Build response
    response = ReelUploadResponse.model_validate(new_reel)
    response.creator_name = current_user.full_name or current_user.email
    return response

@router.post("/", response_model=ReelResponse, status_code=status.HTTP_201_CREATED)
def create_reel(
    reel_data: ReelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new reel with video_url (legacy endpoint for testing)
    """
    if current_user.role != "creator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can upload reels"
        )
    
    new_reel = Reel(
        title=reel_data.title,
        description=reel_data.description,
        video_url=reel_data.video_url,
        tags=reel_data.tags,
        difficulty_level=reel_data.difficulty_level,
        duration_seconds=reel_data.duration_seconds,
        creator_id=current_user.id
    )
    
    db.add(new_reel)
    db.commit()
    db.refresh(new_reel)
    
    response = ReelResponse.model_validate(new_reel)
    response.creator_name = current_user.full_name or current_user.email
    return response

# ✅ MOVED /feed BEFORE /{reel_id} to prevent route collision
@router.get("/feed", response_model=List[ReelResponse])
def get_feed(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    tags: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized feed of reels"""
    query = db.query(Reel)
    
    if tags:
        query = query.filter(Reel.tags.contains(tags))
    if difficulty:
        query = query.filter(Reel.difficulty_level == difficulty)
    
    all_reels = query.all()
    scored_reels = feed_service.score_reels_for_user(db, current_user.id, all_reels)
    paginated_scored = scored_reels[offset:offset + limit]
    
    results = []
    for item in paginated_scored:
        reel = item["reel"]
        creator = db.query(User).filter(User.id == reel.creator_id).first()
        response = ReelResponse.model_validate(reel)
        response.creator_name = creator.full_name or creator.email if creator else "Unknown"
        results.append(response)
    
    return results

@router.get("/list", response_model=List[ReelResponse])
def list_reels(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    creator_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all reels with optional creator filter"""
    query = db.query(Reel)
    
    if creator_id:
        query = query.filter(Reel.creator_id == creator_id)
    
    reels = query.order_by(Reel.created_at.desc()).offset(offset).limit(limit).all()
    
    results = []
    for reel in reels:
        creator = db.query(User).filter(User.id == reel.creator_id).first()
        response = ReelResponse.model_validate(reel)
        response.creator_name = creator.full_name or creator.email if creator else "Unknown"
        results.append(response)
    
    return results

@router.get("/{reel_id}", response_model=ReelResponse)
def get_reel(
    reel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific reel by ID"""
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    
    if not reel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reel not found"
        )
    
    reel.views_count += 1
    db.commit()
    
    creator = db.query(User).filter(User.id == reel.creator_id).first()
    response = ReelResponse.model_validate(reel)
    response.creator_name = creator.full_name or creator.email if creator else "Unknown"
    return response

@router.delete("/{reel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reel(
    reel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a reel (creator only)"""
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    
    if not reel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reel not found")
    
    if reel.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Delete from Cloudinary if exists
    if reel.cloudinary_public_id:
        cloudinary_service.delete_video(reel.cloudinary_public_id)
    
    db.delete(reel)
    db.commit()
    return None
