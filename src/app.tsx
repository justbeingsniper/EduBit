import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Feed } from './pages/learner/Feed';
import ReelView from './pages/learner/ReelView'; // ✅ FIXED: Changed from named to default import
import { MicroCourseView } from './pages/learner/MicroCourseView';
import { Playlists } from './pages/learner/Playlists';
import { CreateReel } from './pages/creator/CreateReel';
import { CreateCourse } from './pages/creator/CreateCourse';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Learner Routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Feed />
              </PrivateRoute>
            }
          />
          <Route
            path="/reel/:id"
            element={
              <PrivateRoute>
                <ReelView />
              </PrivateRoute>
            }
          />
          <Route
            path="/course/:id"
            element={
              <PrivateRoute>
                <MicroCourseView />
              </PrivateRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <PrivateRoute>
                <Playlists />
              </PrivateRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <Playlists />
              </PrivateRoute>
            }
          />

          {/* Creator Routes */}
          <Route
            path="/create-reel"
            element={
              <PrivateRoute>
                <CreateReel />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-course"
            element={
              <PrivateRoute>
                <CreateCourse />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
