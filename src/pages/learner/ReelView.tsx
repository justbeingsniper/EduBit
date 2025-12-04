import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ThumbsUp, Share2, BookOpen, MessageCircle } from 'lucide-react';
import { apiClient } from '@/api/client';
import { Reel } from '@/types';

const ReelView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [reel, setReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadReel();
    loadComments();
  }, [id]);

  const loadReel = async () => {
    try {
      const response = await apiClient.get(`/reels/${id}`);
      setReel(response.data);
      
      // Load AI summary if available
      if (response.data.ai_summary) {
        setSummary({
          summary: response.data.ai_summary,
          key_points: response.data.ai_key_points || []
        });
      } else {
        // Generate AI summary
        try {
          const summaryRes = await apiClient.post('/ai/summary', { reel_id: parseInt(id!) });
          setSummary(summaryRes.data);
        } catch (err) {
          console.log('AI summary not available');
        }
      }
      
      // Load quiz if available
      if (response.data.ai_quiz) {
        setQuiz(response.data.ai_quiz);
        setSelectedAnswers(new Array(response.data.ai_quiz.questions?.length || 0).fill(''));
      } else {
        // Generate quiz
        try {
          const quizRes = await apiClient.post('/ai/quiz', { reel_id: parseInt(id!) });
          setQuiz(quizRes.data);
          setSelectedAnswers(new Array(quizRes.data.questions?.length || 0).fill(''));
        } catch (err) {
          console.log('Quiz not available');
        }
      }
    } catch (error) {
      console.error('Failed to load reel', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await apiClient.get(`/comments/reel/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments', error);
    }
  };

  const handleMarkWatched = async () => {
    try {
      await apiClient.post('/progress/', {
        reel_id: parseInt(id!),
        completed: true
      });
      alert('Marked as watched!');
    } catch (error) {
      console.error('Failed to mark as watched', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await apiClient.post('/comments/', {
        reel_id: parseInt(id!),
        content: newComment
      });
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reel not found</h2>
          <button
            onClick={() => navigate('/feed')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full aspect-video"
              src={reel.video_url}
              onError={(e) => {
                console.error('Video playback error:', e);
              }}
            >
              Your browser doesn't support video playback.
            </video>
          </div>

          {/* Reel Info */}
          <div className="mt-4 bg-white rounded-lg p-6 shadow">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{reel.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>by {reel.creator_name}</span>
              <span>•</span>
              <span>{reel.views_count} views</span>
              <span>•</span>
              <span>{reel.duration_seconds}s</span>
              <span>•</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {reel.difficulty_level}
              </span>
            </div>
            {reel.description && (
              <p className="text-gray-700 mb-4">{reel.description}</p>
            )}
            {reel.tags && (
              <div className="flex flex-wrap gap-2">
                {reel.tags.split(',').map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleMarkWatched}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play size={18} />
                Mark as Watched
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                <ThumbsUp size={18} />
                Like
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-6 bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              Comments ({comments.length})
            </h2>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Post Comment
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800">{comment.user_name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Summary */}
          {summary && (
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <BookOpen size={20} />
                AI Summary
              </h2>
              <p className="text-gray-700 mb-4">{summary.summary}</p>
              {summary.key_points && summary.key_points.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-800 mb-2">Key Points:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {summary.key_points.map((point: string, idx: number) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Quiz Section */}
          {quiz && quiz.questions && quiz.questions.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Practice Quiz</h2>
                <button
                  onClick={() => setShowQuiz(!showQuiz)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  {showQuiz ? 'Hide' : 'Show'}
                </button>
              </div>

              {showQuiz && (
                <div className="space-y-4">
                  {quiz.questions.map((q: any, qIndex: number) => (
                    <div key={qIndex} className="border-b border-gray-200 pb-4 last:border-0">
                      <p className="font-semibold text-gray-800 mb-2">
                        {qIndex + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((option: string, oIndex: number) => (
                          <label
                            key={oIndex}
                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              value={option}
                              checked={selectedAnswers[qIndex] === option}
                              onChange={() => handleAnswerSelect(qIndex, option)}
                              className="text-blue-600"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {selectedAnswers.filter(a => a).length === quiz.questions.length && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="font-semibold text-blue-900">
                        Score:{' '}
                        {selectedAnswers.filter((ans, idx) => ans === quiz.questions[idx].correct_answer).length} /{' '}
                        {quiz.questions.length}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReelView;
