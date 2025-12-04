from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Reel, MicroCourse
from app.schemas import SummaryRequest, SummaryResponse, QuizResponse
from app.api.auth import get_current_user
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.post("/summary", response_model=SummaryResponse)
def generate_summary(
    request: SummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI summary for a reel or micro-course"""
    
    if request.reel_id:
        # Generate summary for single reel
        reel = db.query(Reel).filter(Reel.id == request.reel_id).first()
        if not reel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reel not found"
            )
        
        result = ai_service.generate_summary(
            title=reel.title,
            description=reel.description or "",
            tags=reel.tags or "",
            difficulty=reel.difficulty_level
        )
        
    elif request.course_id:
        # Generate summary for micro-course
        course = db.query(MicroCourse).filter(MicroCourse.id == request.course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Micro-course not found"
            )
        
        # Aggregate content from all reels
        reel_titles = [r.title for r in course.reels]
        combined_description = f"{course.description or ''}\n\nTopics: {', '.join(reel_titles)}"
        
        result = ai_service.generate_summary(
            title=course.title,
            description=combined_description,
            tags="",
            difficulty=course.difficulty_level
        )
        
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either reel_id or course_id"
        )
    
    return SummaryResponse(**result)


@router.post("/quiz", response_model=QuizResponse)
def generate_quiz(
    request: SummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI quiz for a reel or micro-course"""
    
    if request.reel_id:
        # Generate quiz for single reel
        reel = db.query(Reel).filter(Reel.id == request.reel_id).first()
        if not reel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reel not found"
            )
        
        result = ai_service.generate_quiz(
            title=reel.title,
            description=reel.description or "",
            tags=reel.tags or "",
            num_questions=3
        )
        
    elif request.course_id:
        # Generate quiz for micro-course
        course = db.query(MicroCourse).filter(MicroCourse.id == request.course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Micro-course not found"
            )
        
        # Aggregate content
        reel_titles = [r.title for r in course.reels]
        combined_description = f"{course.description or ''}\n\nTopics: {', '.join(reel_titles)}"
        
        result = ai_service.generate_quiz(
            title=course.title,
            description=combined_description,
            tags="",
            num_questions=5
        )
        
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either reel_id or course_id"
        )
    
    return QuizResponse(**result)
