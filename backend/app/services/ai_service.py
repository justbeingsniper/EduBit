from typing import List, Dict, Any, Optional
import json
import os
import tempfile
import requests
from moviepy.editor import VideoFileClip
from app.core.config import settings

# Initialize OpenAI client
try:
    from openai import OpenAI
    if settings.OPENAI_API_KEY:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        AI_ENABLED = True
    else:
        AI_ENABLED = False
        client = None
except Exception:
    AI_ENABLED = False
    client = None

class AIService:
    """Service for AI-powered video transcription and content generation"""
    
    @staticmethod
    def transcribe_video(video_url: str) -> Optional[str]:
        """
        Download video, extract audio, and transcribe using OpenAI Whisper
        Returns transcript text or None if failed
        """
        if not AI_ENABLED or not client:
            print("AI not enabled")
            return None
        
        temp_video_path = None
        temp_audio_path = None
        
        try:
            # Step 1: Download video from Cloudinary URL
            print(f"Downloading video from {video_url}")
            response = requests.get(video_url, stream=True, timeout=60)
            response.raise_for_status()
            
            # Save to temp video file
            temp_video_path = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4').name
            with open(temp_video_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"Video downloaded to {temp_video_path}")
            
            # Step 2: Extract audio using moviepy
            print("Extracting audio from video...")
            video = VideoFileClip(temp_video_path)
            temp_audio_path = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3').name
            video.audio.write_audiofile(temp_audio_path, codec='mp3', verbose=False, logger=None)
            video.close()
            
            print(f"Audio extracted to {temp_audio_path}")
            
            # Step 3: Transcribe audio with OpenAI Whisper
            print("Transcribing audio with Whisper...")
            with open(temp_audio_path, 'rb') as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            
            print(f"Transcription completed: {len(transcript)} characters")
            return transcript
            
        except Exception as e:
            print(f"Transcription error: {str(e)}")
            return None
        
        finally:
            # Cleanup temp files
            if temp_video_path and os.path.exists(temp_video_path):
                try:
                    os.unlink(temp_video_path)
                except:
                    pass
            if temp_audio_path and os.path.exists(temp_audio_path):
                try:
                    os.unlink(temp_audio_path)
                except:
                    pass
    
    @staticmethod
    def generate_summary_from_transcript(
        title: str,
        transcript: str,
        description: str = "",
        tags: str = "",
        difficulty: str = "beginner"
    ) -> Dict[str, Any]:
        """Generate summary from video transcript using GPT"""
        
        if not AI_ENABLED or not client:
            return {
                "summary": f"This content covers {title}. {description[:100] if description else 'Educational video content.'}",
                "key_points": [
                    "Educational content",
                    "Bite-sized learning",
                    f"Difficulty: {difficulty}"
                ]
            }
        
        try:
            # Truncate transcript if too long (GPT token limit)
            max_transcript_length = 3000
            truncated_transcript = transcript[:max_transcript_length] if len(transcript) > max_transcript_length else transcript
            
            prompt = f"""Analyze this educational video and provide a summary.

Title: {title}
Description: {description}
Tags: {tags}
Difficulty Level: {difficulty}

VIDEO TRANSCRIPT:
{truncated_transcript}

Based on the actual video content, provide:
1. A clear 2-3 sentence summary of what the video teaches
2. 3-5 specific key points from the video content

Format as JSON:
{{
  "summary": "your summary based on transcript",
  "key_points": ["specific point 1", "specific point 2", "specific point 3"]
}}"""

            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an educational content analyzer. Analyze video transcripts and provide accurate, specific summaries based on the actual content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=400
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse JSON
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()
            
            result = json.loads(content)
            return result
            
        except Exception as e:
            print(f"Summary generation error: {e}")
            return {
                "summary": f"Learn about {title} in this educational video.",
                "key_points": [
                    "Engaging educational material",
                    "Bite-sized learning format",
                    f"Difficulty level: {difficulty}"
                ]
            }
    
    @staticmethod
    def generate_quiz_from_transcript(
        title: str,
        transcript: str,
        tags: str = "",
        num_questions: int = 3
    ) -> Dict[str, Any]:
        """Generate quiz questions based on video transcript"""
        
        if not AI_ENABLED or not client:
            return {
                "questions": [
                    {
                        "question": f"What is the main topic of '{title}'?",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correct_answer": "Option A"
                    }
                ]
            }
        
        try:
            max_transcript_length = 3000
            truncated_transcript = transcript[:max_transcript_length] if len(transcript) > max_transcript_length else transcript
            
            prompt = f"""Create {num_questions} multiple-choice quiz questions based on this video transcript.

Title: {title}
Tags: {tags}

VIDEO TRANSCRIPT:
{truncated_transcript}

Create questions that:
- Test understanding of concepts actually discussed in the video
- Have 4 options each
- Have exactly one correct answer
- Are clear and unambiguous

Format as JSON:
{{
  "questions": [
    {{
      "question": "Question based on video content?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A"
    }}
  ]
}}

The correct_answer should be the actual text of the correct option, not an index."""

            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an educational quiz generator. Create fair, accurate questions based on video content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=600
            )
            
            content = response.choices[0].message.content.strip()
            
            # Parse JSON
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()
            
            result = json.loads(content)
            return result
            
        except Exception as e:
            print(f"Quiz generation error: {e}")
            return {
                "questions": [
                    {
                        "question": f"What can you learn from '{title}'?",
                        "options": ["Concept 1", "Concept 2", "Concept 3", "Concept 4"],
                        "correct_answer": "Concept 1"
                    }
                ]
            }
    
    # Legacy methods for backward compatibility
    @staticmethod
    def generate_summary(title: str, description: str, tags: str = "", difficulty: str = "beginner") -> Dict[str, Any]:
        """Legacy method - generates summary without transcript"""
        return AIService.generate_summary_from_transcript(title, description, description, tags, difficulty)
    
    @staticmethod
    def generate_quiz(title: str, description: str, tags: str = "", num_questions: int = 3) -> Dict[str, Any]:
        """Legacy method - generates quiz without transcript"""
        return AIService.generate_quiz_from_transcript(title, description, tags, num_questions)

ai_service = AIService()
