import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadReel } from '../../api/endpoints';
import { Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function CreateReel() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    difficulty_level: 'beginner',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast.error('Video file must be less than 100MB');
        return;
      }

      setVideoFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Create FormData
      const data = new FormData();
      data.append('file', videoFile);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('tags', formData.tags);
      data.append('difficulty_level', formData.difficulty_level);

      // Simulate upload progress (you can use axios onUploadProgress for real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      await uploadReel(data);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Reel uploaded successfully! AI is generating metadata...');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to upload reel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Upload New Reel</h1>
      <p className="text-gray-600 mb-6">
        Share your educational content with the community
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video File *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            {videoPreview ? (
              <div className="space-y-4">
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-96 rounded-lg mx-auto"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview('');
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove Video
                </button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  MP4, MOV, AVI (max 100MB)
                </p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="video-upload"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Select Video
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Introduction to React Hooks"
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what learners will learn from this reel..."
            disabled={loading}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="react, javascript, hooks (comma-separated)"
            disabled={loading}
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Upload Progress */}
        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !videoFile}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Reel'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
