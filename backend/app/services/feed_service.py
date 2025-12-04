from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Reel, Progress, User
from collections import Counter

class FeedService:
    """Service for personalized feed scoring and recommendations"""
    
    @staticmethod
    def score_reels_for_user(db: Session, user_id: int, reels: List[Reel]) -> List[Dict[str, Any]]:
        """
        Score reels based on user's watch history and preferences
        Returns list of dicts with reel and score
        """
        # Get user's watch history
        watched = db.query(Progress).filter(
            Progress.user_id == user_id,
            Progress.reel_id.isnot(None)
        ).all()
        
        # Extract tags and difficulty levels from watched reels
        watched_reel_ids = [p.reel_id for p in watched]
        watched_reels = db.query(Reel).filter(Reel.id.in_(watched_reel_ids)).all() if watched_reel_ids else []
        
        # Build user preference profile
        tag_counts = Counter()
        difficulty_counts = Counter()
        
        for reel in watched_reels:
            if reel.tags:
                tags = [t.strip() for t in reel.tags.split(",")]
                tag_counts.update(tags)
            if reel.difficulty_level:
                difficulty_counts[reel.difficulty_level] += 1
        
        # Score each reel
        scored_reels = []
        for reel in reels:
            score = 0.0
            
            # Base score: recency (newer is better)
            score += 10.0
            
            # Tag overlap score (max +30 points)
            if reel.tags and tag_counts:
                reel_tags = set([t.strip() for t in reel.tags.split(",")])
                watched_tags = set(tag_counts.keys())
                overlap = len(reel_tags & watched_tags)
                score += min(overlap * 10, 30)
            
            # Difficulty match score (max +20 points)
            if reel.difficulty_level and difficulty_counts:
                preferred_difficulty = difficulty_counts.most_common(1)[0][0] if difficulty_counts else "beginner"
                if reel.difficulty_level == preferred_difficulty:
                    score += 20
                elif abs(FeedService._difficulty_to_num(reel.difficulty_level) - FeedService._difficulty_to_num(preferred_difficulty)) == 1:
                    score += 10
            
            # Popularity score (max +15 points)
            score += min((reel.views_count / 100) * 5, 15)
            
            # Avoid already watched (penalty -50 points)
            if reel.id in watched_reel_ids:
                score -= 50
            
            scored_reels.append({
                "reel": reel,
                "score": score
            })
        
        # Sort by score descending
        scored_reels.sort(key=lambda x: x["score"], reverse=True)
        return scored_reels
    
    @staticmethod
    def _difficulty_to_num(difficulty: str) -> int:
        """Convert difficulty level to number for comparison"""
        mapping = {
            "beginner": 1,
            "intermediate": 2,
            "advanced": 3
        }
        return mapping.get(difficulty, 1)

feed_service = FeedService()
