import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';

const SeriesDetails = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await axios.get(`https://netflix-xovf.onrender.com/api/content/series/${id}`);
        setSeries(res.data);
        if (res.data.seasons && res.data.seasons.length > 0) {
          setSelectedSeason(res.data.seasons[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSeries();
  }, [id]);

  if (!series) {
    return <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">Loading...</div>;
  }

  const handleSeasonChange = (e) => {
    const seasonId = e.target.value;
    const season = series.seasons.find(s => s._id === seasonId);
    setSelectedSeason(season);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white pb-20">
      {/* Hero Banner */}
      <div className="relative h-[60vh] md:h-[80vh] w-full">
        <div className="absolute inset-0">
          <img 
            src={series.bannerImage || series.thumbnail} 
            alt={series.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 z-10 flex flex-col justify-end">
          <h1 className="text-4xl md:text-7xl font-bold mb-4 drop-shadow-lg">{series.title}</h1>
          <div className="flex items-center gap-4 text-sm md:text-base font-semibold text-gray-300 mb-6">
            <span className="text-green-500 font-bold">98% Match</span>
            <span>{new Date(series.createdAt).getFullYear()}</span>
            <span className="border border-gray-500 px-1 text-xs">TV-MA</span>
            <span>{series.seasons?.length || 0} Seasons</span>
            <span className="border border-gray-600 px-1 rounded text-xs">HD</span>
          </div>
          
          <div className="flex gap-4 mb-6">
            <button className="bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded flex items-center gap-2 font-bold hover:bg-white/80 transition">
              <Play className="w-6 h-6 fill-black" /> Play
            </button>
            <button className="border border-gray-500 bg-gray-500/30 text-white p-3 rounded-full hover:bg-gray-500/50 transition">
              <Plus className="w-6 h-6" />
            </button>
            <button className="border border-gray-500 bg-gray-500/30 text-white p-3 rounded-full hover:bg-gray-500/50 transition">
              <ThumbsUp className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-2xl text-lg md:text-xl text-gray-200 mb-2 leading-relaxed">
            {series.description}
          </div>
          <div className="text-gray-400 text-sm mb-4">
            <span className="text-gray-500">Genres:</span> Romantic, Drama, Memories
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="px-4 md:px-12 mt-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Episodes</h2>
          {series.seasons && series.seasons.length > 0 && (
            <div className="relative inline-block">
              <select 
                className="appearance-none bg-[#242424] text-white border border-gray-600 rounded px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer font-bold text-lg"
                value={selectedSeason?._id || ''}
                onChange={handleSeasonChange}
              >
                {series.seasons.map((season) => (
                  <option key={season._id} value={season._id}>
                    Season {season.seasonNumber}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {selectedSeason && selectedSeason.episodes && selectedSeason.episodes.length > 0 ? (
            selectedSeason.episodes.map((episode) => (
              <Link 
                to={`/watch/${episode._id}`} 
                key={episode._id}
                className="flex items-center gap-4 p-4 rounded-md hover:bg-[#333] transition duration-300 cursor-pointer border-b border-[#222]"
              >
                <div className="text-2xl text-gray-500 font-bold w-8 text-center">
                  {episode.episodeNumber}
                </div>
                <div className="relative w-32 md:w-48 h-20 md:h-28 flex-shrink-0 rounded overflow-hidden">
                  <img 
                    src={episode.thumbnail} 
                    alt={episode.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <Play className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-bold text-white">{episode.title}</h3>
                    <span className="text-gray-400 text-sm">{episode.duration ? `${episode.duration}m` : ''}</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 md:line-clamp-3">
                    {episode.description}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-gray-500">No episodes available for this season.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetails;
