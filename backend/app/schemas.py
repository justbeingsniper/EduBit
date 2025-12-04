from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ========== User Schemas ==========
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "learner"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ========== Reel Schemas ==========
class ReelBase(BaseModel):
    title: str
    description: Optional[str] = None
    tags: Optional[str] = None
    difficulty_level: str = "beginner"

class ReelCreate(BaseModel):
    """Schema for creating reel with video_url (legacy support)"""
    title: str
    description: Optional[str] = None
    video_url: str
    tags: Optional[str] = None
    difficulty_level: str = "beginner"
    duration_seconds: int = 60

class ReelUploadResponse(BaseModel):
    """Response after video upload with AI metadata"""
    id: int
    title: str
    description: Optional[str] = None
    video_url: str
    cloudinary_public_id: Optional[str] = None
    tags: Optional[str] = None
    difficulty_level: str
    duration_seconds: int
    creator_id: int
    created_at: datetime
    views_count: int
    ai_summary: Optional[str] = None
    ai_key_points: Optional[List[str]] = None
    ai_quiz: Optional[dict] = None
    creator_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class ReelResponse(BaseModel):
    """Standard reel response"""
    id: int
    title: str
    description: Optional[str] = None
    video_url: str
    tags: Optional[str] = None
    difficulty_level: str
    duration_seconds: int
    creator_id: int
    created_at: datetime
    views_count: int
    creator_name: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_key_points: Optional[List[str]] = None
    ai_quiz: Optional[dict] = None
    
    class Config:
        from_attributes = True

# ========== MicroCourse Schemas ==========
class MicroCourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty_level: str = "beginner"

class MicroCourseCreate(MicroCourseBase):
    reel_ids: List[int]

class MicroCourseResponse(MicroCourseBase):
    id: int
    creator_id: int
    created_at: datetime
    reels: List[ReelResponse] = []
    
    class Config:
        from_attributes = True

# ========== Playlist Schemas ==========
class PlaylistBase(BaseModel):
    title: str
    description: Optional[str] = None

class PlaylistCreate(PlaylistBase):
    pass

class PlaylistAddReel(BaseModel):
    reel_id: int

class PlaylistResponse(PlaylistBase):
    id: int
    user_id: int
    created_at: datetime
    reels: List[ReelResponse] = []
    
    class Config:
        from_attributes = True

# ========== Progress Schemas ==========
class ProgressCreate(BaseModel):
    reel_id: Optional[int] = None
    course_id: Optional[int] = None
    completed: bool = True

class ProgressResponse(BaseModel):
    id: int
    user_id: int
    reel_id: Optional[int]
    course_id: Optional[int]
    completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CourseProgressResponse(BaseModel):
    course_id: int
    total_reels: int
    completed_reels: int
    completion_percentage: float

# ========== Comment Schemas ==========
class CommentCreate(BaseModel):
    content: str
    reel_id: int

class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    reel_id: int
    created_at: datetime
    user_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# ========== AI Schemas ==========
class SummaryRequest(BaseModel):
    reel_id: Optional[int] = None
    course_id: Optional[int] = None

class SummaryResponse(BaseModel):
    summary: str
    key_points: List[str]

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]

class FeedRequest(BaseModel):
    limit: int = 20
    offset: int = 0
    tags: Optional[str] = None
    difficulty: Optional[str] = None
