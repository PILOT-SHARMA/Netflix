import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import ProfileSelection from './pages/ProfileSelection';
import Home from './pages/Home';
import SeriesDetails from './pages/SeriesDetails';
import VideoPlayer from './pages/VideoPlayer';
import Upload from './pages/Upload';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { token, activeProfile } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" />;
  if (!activeProfile && window.location.pathname !== '/profiles') return <Navigate to="/profiles" />;
  return children;
};

function AppRoutes() {
  const { token, activeProfile } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {token && activeProfile && <Navbar />}
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/profiles" />} />
        <Route path="/profiles" element={token ? <ProfileSelection /> : <Navigate to="/login" />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/series/:id" element={<PrivateRoute><SeriesDetails /></PrivateRoute>} />
        <Route path="/watch/:id" element={<PrivateRoute><VideoPlayer /></PrivateRoute>} />
        <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
