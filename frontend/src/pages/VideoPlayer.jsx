import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipForward } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeProfile, token } = useContext(AuthContext);
  
  const [episode, setEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const res = await axios.get(`https://netflix-xovf.onrender.com/api/content/episodes/${id}`);
        setEpisode(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEpisode();
  }, [id]);

  // Load progress
  useEffect(() => {
    if (episode && videoRef.current && activeProfile) {
      const history = activeProfile.watchHistory?.find(h => h.episodeId === id);
      if (history && history.progress) {
        videoRef.current.currentTime = history.progress;
      }
    }
  }, [episode, activeProfile, id]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    videoRef.current.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleProgressChange = (e) => {
    const val = parseFloat(e.target.value);
    videoRef.current.currentTime = (val / 100) * duration;
    setProgress(val);
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setProgress((current / dur) * 100);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Save progress on pause or unmount
  const saveProgress = async () => {
    // This logic needs a corresponding backend route to save progress
    // For now, it's just a placeholder or could be implemented if backend supports it
  };

  const handleEnded = () => {
    // Auto-play logic could go here to fetch the next episode in the season
    // navigate(`/watch/${nextEpisodeId}`)
    navigate(-1);
  };

  if (!episode) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div 
      className="h-screen w-full bg-black relative overflow-hidden flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video 
        ref={videoRef}
        src={episode.videoUrl}
        className="w-full h-full object-contain"
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={handleEnded}
        onClick={togglePlay}
        onPause={saveProgress}
      />
      
      {/* Back Button */}
      <div className={`absolute top-8 left-8 z-50 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <ArrowLeft 
          className="w-10 h-10 text-white cursor-pointer hover:text-gray-300 drop-shadow-md" 
          onClick={() => { saveProgress(); navigate(-1); }} 
        />
      </div>

      {/* Controls Overlay */}
      <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-4">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress || 0}
            onChange={handleProgressChange}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <span className="text-white text-sm font-medium w-16 text-right">
            {videoRef.current ? formatTime(duration - videoRef.current.currentTime) : '00:00'}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:text-gray-300 transition">
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
            </button>
            <button className="text-white hover:text-gray-300 transition">
               <SkipForward className="w-8 h-8 fill-current" onClick={handleEnded} />
            </button>
            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="text-white hover:text-gray-300 transition">
                {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
              </button>
              <input 
                type="range" 
                min="0" max="1" step="0.1" 
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/vol:w-24 group-hover/vol:opacity-100 transition-all duration-300 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
            <div className="text-white text-xl font-bold ml-4">
              {episode.title}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition">
              <Maximize className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
