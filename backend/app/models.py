from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Table, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

# Association table for micro-course reels
course_reels = Table(
    'course_reels',
    Base.metadata,
    Column('course_id', Integer, ForeignKey('micro_courses.id')),
    Column('reel_id', Integer, ForeignKey('reels.id'))
)

# Association table for playlist reels
playlist_reels = Table(
    'playlist_reels',
    Base.metadata,
    Column('playlist_id', Integer, ForeignKey('playlists.id')),
    Column('reel_id', Integer, ForeignKey('reels.id'))
)

class User(Base):
    """User model - can be learner or creator"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="learner")  # 'learner' or 'creator'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    reels = relationship("Reel", back_populates="creator", cascade="all, delete-orphan")
    micro_courses = relationship("MicroCourse", back_populates="creator", cascade="all, delete-orphan")
    playlists = relationship("Playlist", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")

class Reel(Base):
    """Educational reel - 30-90 second video"""
    __tablename__ = "reels"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    video_url = Column(String(500), nullable=False)
    cloudinary_public_id = Column(String(255), nullable=True)  # NEW: For deletion
    tags = Column(String(500))  # Comma-separated tags
    difficulty_level = Column(String(50), default="beginner")  # beginner, intermediate, advanced
    duration_seconds = Column(Integer, default=60)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    views_count = Column(Integer, default=0)
    
    # AI-generated fields
    ai_summary = Column(Text, nullable=True)  # NEW: AI-generated summary
    ai_key_points = Column(JSON, nullable=True)  # NEW: List of key points
    ai_quiz = Column(JSON, nullable=True)  # NEW: Quiz questions
    transcript = Column(Text, nullable=True)
    # Relationships
    creator = relationship("User", back_populates="reels")
    comments = relationship("Comment", back_populates="reel", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="reel", cascade="all, delete-orphan")
    courses = relationship("MicroCourse", secondary=course_reels, back_populates="reels")
    playlists = relationship("Playlist", secondary=playlist_reels, back_populates="reels")

class MicroCourse(Base):
    """Structured micro-course built from multiple reels"""
    __tablename__ = "micro_courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    difficulty_level = Column(String(50), default="beginner")
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    creator = relationship("User", back_populates="micro_courses")
    reels = relationship("Reel", secondary=course_reels, back_populates="courses")
    progress = relationship("Progress", back_populates="course", cascade="all, delete-orphan")

class Playlist(Base):
    """User-created playlist of reels"""
    __tablename__ = "playlists"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="playlists")
    reels = relationship("Reel", secondary=playlist_reels, back_populates="playlists")

class Progress(Base):
    """Track user progress on reels and courses"""
    __tablename__ = "progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reel_id = Column(Integer, ForeignKey("reels.id"), nullable=True)
    course_id = Column(Integer, ForeignKey("micro_courses.id"), nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="progress")
    reel = relationship("Reel", back_populates="progress")
    course = relationship("MicroCourse", back_populates="progress")

class Comment(Base):
    """Comments on reels"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reel_id = Column(Integer, ForeignKey("reels.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="comments")
    reel = relationship("Reel", back_populates="comments")
