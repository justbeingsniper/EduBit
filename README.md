# EduBit: Bite-Sized Learning Platform

## 🎯 Product Overview

### The Problem
Education today is broken:
- **Too Long**: Hour-long lectures and courses people never finish
- **Not Engaging**: Static PDFs and slides can't compete with TikTok/Instagram
- **Lacks Structure**: Social media is engaging but not organized for learning
- **Not Personalized**: One-size-fits-all content doesn't match individual pace

### The Solution: Instagram Reels Meets Udemy
EduBit is an addictive learning platform that combines:
- **30-90 second educational reels** from expert creators
- **Structured micro-courses** built from bite-sized videos
- **AI-powered personalization** with summaries, quizzes, and smart feed
- **Progress tracking** with playlists and completion metrics

## 👥 User Personas

### 1. The Time-Strapped Student (Sarah, 21)
- **Pain**: Exam prep with limited time, needs quick concept refreshers
- **Needs**: Short, focused lessons; progress tracking; quiz practice
- **Uses EduBit**: Builds custom playlists for each subject, gets AI quizzes

### 2. The Career Switcher (Mike, 28)
- **Pain**: Learning to code after work, courses too long and boring
- **Needs**: Bite-sized daily learning; structured path; real engagement
- **Uses EduBit**: Follows coding creators, completes micro-courses, tracks skills

### 3. The Creator/Educator (Dr. Kim, 35)
- **Pain**: Students skip long lectures, hard to monetize teaching
- **Needs**: Easy content creation; analytics; revenue opportunities
- **Uses EduBit**: Uploads 60-sec concept explainers, builds courses, earns from learners

## ✨ Core Features

### For Creators
- ✅ Upload 30-90 sec educational reels with tags and difficulty levels
- ✅ Build structured micro-courses from multiple reels
- ✅ Track engagement metrics (views, completion, comments)
- ✅ Engage via comments and Q&A

### For Learners
- ✅ AI-personalized learning feed (based on interests, level, history)
- ✅ Follow creators and build custom playlists
- ✅ Track progress across micro-courses
- ✅ Get AI-generated summaries and quizzes for any content
- ✅ Comment and interact with creators

### Platform/AI
- ✅ Smart feed algorithm (tags, difficulty, watch history)
- ✅ Auto-generate summaries from reel content
- ✅ Create practice quizzes with multiple-choice questions
- ✅ Personalized recommendations

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React + Vite, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), SQLAlchemy ORM, SQLite
- **Auth**: JWT-based (email + password)
- **AI**: OpenAI-compatible API (GPT-4, Claude, etc.)

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  React + TypeScript + Tailwind                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Feed    │  │  Reel    │  │ Creator  │             │
│  │  Page    │  │  View    │  │  Pages   │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │              │                    │
│       └─────────────┴──────────────┘                    │
│                     │                                   │
│              API Client (Axios)                         │
└─────────────────────┼───────────────────────────────────┘
                      │ HTTP/JSON + JWT
┌─────────────────────┼───────────────────────────────────┐
│              FASTAPI BACKEND                            │
│  ┌─────────────────────────────────────────────┐       │
│  │  Routers: auth, reels, courses, AI, etc.    │       │
│  └─────────────┬───────────────────────────────┘       │
│                │                                        │
│  ┌─────────────┴───────────────┐                       │
│  │   Services Layer            │                       │
│  │  ┌──────────┐  ┌──────────┐│                       │
│  │  │AI Service│  │Feed Score││                       │
│  │  └────┬─────┘  └──────────┘│                       │
│  └───────┼─────────────────────┘                       │
│          │                                             │
│  ┌───────┴─────────────┐                               │
│  │  Database (SQLite)  │                               │
│  │  SQLAlchemy Models  │                               │
│  └─────────────────────┘                               │
└─────────────────┼───────────────────────────────────────┘
                  │
┌─────────────────┼───────────────────────────────────────┐
│          EXTERNAL AI API (OpenAI, etc.)                 │
│  - Generate summaries                                   │
│  - Create quizzes                                       │
│  - Assist with recommendations                          │
└─────────────────────────────────────────────────────────┘
```

### Data Flow
1. **User Action** (Frontend): Click "Get Summary" on a reel
2. **API Request**: POST `/api/ai/summary` with reel_id + JWT token
3. **Backend Processing**:
   - Validate JWT, extract user
   - Fetch reel from database
   - Call AI service with reel content
4. **AI Service**: Send prompt to OpenAI API, parse response
5. **Response**: Return summary JSON to frontend
6. **UI Update**: Display summary in component

---

## 📁 Project Structure

```
EduBit/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── database.py             # SQLite connection
│   │   ├── models.py               # SQLAlchemy models
│   │   ├── schemas.py              # Pydantic schemas
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py           # Settings & env vars
│   │   │   └── security.py         # JWT helpers
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ai_service.py       # AI summary/quiz generation
│   │   │   └── feed_service.py     # Personalized feed scoring
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── auth.py             # Auth endpoints
│   │       ├── reels.py            # Reel CRUD + feed
│   │       ├── courses.py          # Micro-course management
│   │       ├── playlists.py        # User playlists
│   │       ├── progress.py         # Watch progress tracking
│   │       ├── comments.py         # Comments on reels
│   │       └── ai.py               # AI endpoints
│   ├── requirements.txt
│   └── .env.example
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Router setup
│   ├── api/
│   │   ├── client.ts               # Axios instance
│   │   └── endpoints.ts            # API functions
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ReelCard.tsx
│   │   ├── MicroCourseCard.tsx
│   │   ├── PlaylistCard.tsx
│   │   ├── TagBadge.tsx
│   │   └── Loader.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── learner/
│   │   │   ├── Feed.tsx
│   │   │   ├── ReelView.tsx
│   │   │   ├── MicroCourseView.tsx
│   │   │   └── Playlists.tsx
│   │   └── creator/
│   │       ├── CreateReel.tsx
│   │       └── CreateCourse.tsx
│   └── types/
│       └── index.ts
├── package.json
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Python 3.9+**
- **Node.js 18+** and npm
- **OpenAI API Key** (or compatible AI service)

### Backend Setup

1. **Create virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment**
Create `.env` file in `backend/` directory:
```bash
# backend/.env
OPENAI_API_KEY=sk-your-key-here
SECRET_KEY=your-super-secret-jwt-key-change-this
DATABASE_URL=sqlite:///./EduBit.db
```

4. **Initialize database**
```bash
# Database tables will be created automatically on first run
```

5. **Start backend server**
```bash
uvicorn app.main:app --reload --port 8000
```
Backend will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure API URL**
Create `.env` file in root directory:
```bash
VITE_API_URL=http://localhost:8000
```

3. **Start development server**
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

---

## 🎮 Usage Guide

### For Learners

1. **Register Account**
   - Go to `/register`
   - Choose "Learner" role
   - Enter email and password

2. **Browse Feed**
   - Home page shows personalized reel feed
   - Scroll through educational content
   - Filter by tags and difficulty

3. **Watch & Learn**
   - Click any reel to view
   - Get AI-generated summary
   - Take practice quiz
   - Comment and engage

4. **Track Progress**
   - Build custom playlists
   - Enroll in micro-courses
   - Mark reels as watched
   - View completion percentage

### For Creators

1. **Register as Creator**
   - Choose "Creator" role during registration

2. **Upload Reels**
   - Go to `/create-reel`
   - Add title, description, video URL
   - Tag topics and set difficulty level
   - Submit to feed

3. **Build Micro-Courses**
   - Go to `/create-course`
   - Select multiple reels
   - Set course title and description
   - Publish structured learning path

4. **Engage Learners**
   - Reply to comments
   - View analytics (coming soon)

---

## 🧪 Testing the Platform

### Quick Test Flow

1. **Register two accounts**: one creator, one learner
2. **As Creator**: Upload 3-5 reels on different topics
3. **As Creator**: Build a micro-course from 3 reels
4. **As Learner**: Browse feed, watch reels
5. **As Learner**: Click "Get Summary" and "Generate Quiz"
6. **As Learner**: Create a playlist, add reels
7. **As Learner**: Enroll in the micro-course, track progress

### Sample Reel Ideas
- "Python List Comprehensions in 60 seconds"
- "Git Rebase vs Merge - Quick Explanation"
- "Spanish Verbs: Ser vs Estar"
- "Calculate ROI - Finance Basics"

---

## 🐛 Troubleshooting

### Backend Issues
- **Error: No module named 'app'**: Make sure you're in the `backend/` directory
- **Database locked**: Stop any running backend instances
- **401 Unauthorized**: Check JWT token in localStorage

### Frontend Issues
- **CORS Error**: Ensure backend is running and CORS is configured
- **API not found**: Verify `VITE_API_URL` in `.env` matches backend URL
- **Blank page**: Check browser console for errors

### AI Issues
- **No AI responses**: Verify `OPENAI_API_KEY` is set in backend `.env`
- **Rate limit errors**: Use a valid API key with credits
- **Slow responses**: Normal for GPT-4, consider using GPT-3.5 for faster results

---

## 🎯 Key Differentiators

### vs Instagram/TikTok
- **Structured learning paths** (micro-courses, not just random scrolling)
- **Progress tracking** and completion metrics
- **AI-powered quizzes** for practice and retention

### vs YouTube/YouTube Shorts
- **Micro-course bundles** from multiple shorts
- **Personalized feed** tuned for learning, not just engagement
- **Built-in practice tools** (AI quizzes, summaries)

### vs Udemy/Coursera
- **Bite-sized content** (30-90 sec vs 2-hour lectures)
- **Creator-driven & social** (follow, comment, engage)
- **Instant gratification** (complete lessons in seconds)

---

## 📊 Business Strategy

### Target ICPs
1. **Students (18-24)**: Exam prep, concept reinforcement, study supplements
2. **Young Professionals (25-35)**: Career upskilling, certifications, quick learning
3. **Content Creators/Educators**: Monetize teaching, reach global audience

### Growth Strategy
- **Phase 1**: Launch in niche communities (coding bootcamps, language learning groups)
- **Phase 2**: Viral sharing (social proof badges, "I learned X in 60 seconds")
- **Phase 3**: Creator marketplace (paid courses, revenue share)

### Monetization
- **Freemium**: Free browsing, premium features (unlimited playlists, advanced AI)
- **Creator Revenue**: Share subscription fees with top creators
- **Paid Micro-Courses**: Creators set prices, platform takes 20-30%
- **Enterprise**: Corporate training packages

---

## 📝 License & Contributing

This is a hackathon MVP. Feel free to fork and extend.

---

## 🎤 5-Minute Pitch Outline

### Opening Hook (30 sec)
"Raise your hand if you've ever started a Udemy course and never finished. Now raise your hand if you've spent 2 hours on TikTok today. That's the problem we're solving."

### Problem (1 min)
- Education is stuck in 2-hour lectures
- Social media has our attention, but not structure
- We scroll endlessly, but learn nothing
- Courses have structure, but no one finishes them

### Solution (1.5 min)
- **EduBit**: Instagram Reels meets Udemy
- 30-90 second educational reels from expert creators
- Build micro-courses, track progress, get AI quizzes
- Learn while scrolling, but with actual outcomes

### Demo (1.5 min)
- Show feed scrolling (learner view)
- Click into reel, get AI summary and quiz
- Show micro-course progress tracking
- Switch to creator view, upload reel in 30 seconds

### Market & Traction (30 sec)
- $300B global e-learning market
- Gen Z spends 3+ hours/day on short-form video
- Creators want monetization beyond ad revenue
- Beta waitlist: [make up number] signups

### Closing (30 sec)
"We're not just making education shorter. We're making it addictive, social, and effective. The future of learning is 60 seconds at a time."

---

**Built with ❤️ for the future of learning**
