from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Comment, Reel
from app.schemas import CommentCreate, CommentResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a comment to a reel"""
    
    # Verify reel exists
    reel = db.query(Reel).filter(Reel.id == comment_data.reel_id).first()
    if not reel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reel not found"
        )
    
    new_comment = Comment(
        content=comment_data.content,
        user_id=current_user.id,
        reel_id=comment_data.reel_id
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    response = CommentResponse.model_validate(new_comment)
    response.user_name = current_user.full_name or current_user.email
    
    return response


@router.get("/reel/{reel_id}", response_model=List[CommentResponse])
def get_reel_comments(
    reel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all comments for a reel"""
    
    comments = db.query(Comment).filter(
        Comment.reel_id == reel_id
    ).order_by(Comment.created_at.desc()).all()
    
    results = []
    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()
        response = CommentResponse.model_validate(comment)
        response.user_name = user.full_name or user.email if user else "Unknown"
        results.append(response)
    
    return results
