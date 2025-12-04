import cloudinary
import cloudinary.uploader
from typing import Dict, Any
from fastapi import UploadFile, HTTPException
from app.core.config import settings

# Initialize Cloudinary
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    CLOUDINARY_ENABLED = True
else:
    CLOUDINARY_ENABLED = False

class CloudinaryService:
    """Service for uploading videos to Cloudinary"""
    
    @staticmethod
    async def upload_video(file: UploadFile, folder: str = "edubit/reels") -> Dict[str, Any]:
        """Upload video to Cloudinary"""
        if not CLOUDINARY_ENABLED:
            raise HTTPException(
                status_code=500,
                detail="Cloudinary is not configured. Please set CLOUDINARY credentials in .env"
            )
        
        if not file.content_type or not file.content_type.startswith("video/"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Expected video/*, got {file.content_type}"
            )
        
        try:
            contents = await file.read()
            
            result = cloudinary.uploader.upload(
                contents,
                resource_type="video",
                folder=folder,
                overwrite=True,
                transformation=[{"quality": "auto", "fetch_format": "auto"}],
                eager=[{"width": 720, "height": 1280, "crop": "limit", "quality": "auto"}],
                eager_async=True
            )
            
            return {
                "secure_url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "duration": result.get("duration", 0),
                "format": result.get("format"),
                "width": result.get("width"),
                "height": result.get("height"),
                "resource_type": result.get("resource_type")
            }
            
        except Exception as e:
            print(f"Cloudinary upload error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload video to Cloudinary: {str(e)}"
            )
    
    @staticmethod
    def delete_video(public_id: str) -> bool:
        """Delete video from Cloudinary"""
        if not CLOUDINARY_ENABLED:
            return False
        
        try:
            result = cloudinary.uploader.destroy(public_id, resource_type="video")
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Cloudinary delete error: {str(e)}")
            return False

cloudinary_service = CloudinaryService()
