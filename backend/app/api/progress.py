from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from app.database import get_db
from app.models import User, Progress, MicroCourse, Reel
from app.schemas import ProgressCreate, ProgressResponse, CourseProgressResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.post("/", response_model=ProgressResponse, status_code=status.HTTP_201_CREATED)
def mark_progress(
    progress_data: ProgressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a reel or course as watched/completed"""
    
    # Check if progress already exists
    existing = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.reel_id == progress_data.reel_id if progress_data.reel_id else False,
        Progress.course_id == progress_data.course_id if progress_data.course_id else False
    ).first()
    
    if existing:
        # Update existing
        existing.completed = progress_data.completed
        if progress_data.completed:
            existing.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return ProgressResponse.model_validate(existing)
    
    # Create new progress entry
    new_progress = Progress(
        user_id=current_user.id,
        reel_id=progress_data.reel_id,
        course_id=progress_data.course_id,
        completed=progress_data.completed,
        completed_at=datetime.utcnow() if progress_data.completed else None
    )
    
    db.add(new_progress)
    db.commit()
    db.refresh(new_progress)
    
    return ProgressResponse.model_validate(new_progress)


@router.get("/course/{course_id}", response_model=CourseProgressResponse)
def get_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get progress for a specific micro-course"""
    
    # Get course
    course = db.query(MicroCourse).filter(MicroCourse.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Get total reels in course
    total_reels = len(course.reels)
    
    if total_reels == 0:
        return CourseProgressResponse(
            course_id=course_id,
            total_reels=0,
            completed_reels=0,
            completion_percentage=0.0
        )
    
    # Get completed reels for this user
    reel_ids = [r.id for r in course.reels]
    completed = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.reel_id.in_(reel_ids),
        Progress.completed == True
    ).count()
    
    completion_percentage = (completed / total_reels) * 100
    
    return CourseProgressResponse(
        course_id=course_id,
        total_reels=total_reels,
        completed_reels=completed,
        completion_percentage=round(completion_percentage, 2)
    )


@router.get("/", response_model=List[ProgressResponse])
def get_my_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all progress entries for current user"""
    
    progress_entries = db.query(Progress).filter(
        Progress.user_id == current_user.id
    ).order_by(Progress.created_at.desc()).all()
    
    return [ProgressResponse.model_validate(p) for p in progress_entries]
