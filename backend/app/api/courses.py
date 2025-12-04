from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, MicroCourse, Reel
from app.schemas import MicroCourseCreate, MicroCourseResponse, ReelResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/courses", tags=["Micro-Courses"])


@router.post("/", response_model=MicroCourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course_data: MicroCourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new micro-course (creators only)"""
    
    if current_user.role != "creator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can create micro-courses"
        )
    
    # Verify all reels exist and belong to creator
    reels = db.query(Reel).filter(Reel.id.in_(course_data.reel_ids)).all()
    
    if len(reels) != len(course_data.reel_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more reels not found"
        )
    
    # Check ownership
    for reel in reels:
        if reel.creator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Can only add your own reels to a course"
            )
    
    # Create course
    new_course = MicroCourse(
        title=course_data.title,
        description=course_data.description,
        difficulty_level=course_data.difficulty_level,
        creator_id=current_user.id
    )
    
    new_course.reels = reels
    
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    # Build response
    response = MicroCourseResponse.model_validate(new_course)
    response.reels = [ReelResponse.model_validate(r) for r in reels]
    
    return response


@router.get("/{course_id}", response_model=MicroCourseResponse)
def get_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific micro-course by ID"""
    
    course = db.query(MicroCourse).filter(MicroCourse.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Micro-course not found"
        )
    
    response = MicroCourseResponse.model_validate(course)
    response.reels = [ReelResponse.model_validate(r) for r in course.reels]
    
    return response


@router.get("/", response_model=List[MicroCourseResponse])
def list_courses(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all micro-courses"""
    
    courses = db.query(MicroCourse).order_by(MicroCourse.created_at.desc()).offset(offset).limit(limit).all()
    
    results = []
    for course in courses:
        response = MicroCourseResponse.model_validate(course)
        response.reels = [ReelResponse.model_validate(r) for r in course.reels]
        results.append(response)
    
    return results
