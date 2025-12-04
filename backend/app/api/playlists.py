from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Playlist, Reel
from app.schemas import PlaylistCreate, PlaylistResponse, PlaylistAddReel, ReelResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/playlists", tags=["Playlists"])


@router.post("/", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
def create_playlist(
    playlist_data: PlaylistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new playlist"""
    
    new_playlist = Playlist(
        title=playlist_data.title,
        description=playlist_data.description,
        user_id=current_user.id
    )
    
    db.add(new_playlist)
    db.commit()
    db.refresh(new_playlist)
    
    return PlaylistResponse.model_validate(new_playlist)


@router.post("/{playlist_id}/reels", response_model=PlaylistResponse)
def add_reel_to_playlist(
    playlist_id: int,
    reel_data: PlaylistAddReel,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a reel to a playlist"""
    
    # Get playlist
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.user_id == current_user.id
    ).first()
    
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found or access denied"
        )
    
    # Get reel
    reel = db.query(Reel).filter(Reel.id == reel_data.reel_id).first()
    if not reel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reel not found"
        )
    
    # Add reel if not already in playlist
    if reel not in playlist.reels:
        playlist.reels.append(reel)
        db.commit()
        db.refresh(playlist)
    
    response = PlaylistResponse.model_validate(playlist)
    response.reels = [ReelResponse.model_validate(r) for r in playlist.reels]
    
    return response


@router.get("/", response_model=List[PlaylistResponse])
def get_my_playlists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all playlists for current user"""
    
    playlists = db.query(Playlist).filter(Playlist.user_id == current_user.id).all()
    
    results = []
    for playlist in playlists:
        response = PlaylistResponse.model_validate(playlist)
        response.reels = [ReelResponse.model_validate(r) for r in playlist.reels]
        results.append(response)
    
    return results


@router.get("/{playlist_id}", response_model=PlaylistResponse)
def get_playlist(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific playlist"""
    
    playlist = db.query(Playlist).filter(
        Playlist.id == playlist_id,
        Playlist.user_id == current_user.id
    ).first()
    
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )
    
    response = PlaylistResponse.model_validate(playlist)
    response.reels = [ReelResponse.model_validate(r) for r in playlist.reels]
    
    return response
