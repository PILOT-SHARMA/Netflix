import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MediaRow from '../components/MediaRow';
import { Play, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [series, setSeries] = useState([]);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/content/series');
        setSeries(res.data);
        if (res.data.length > 0) {
          setFeatured(res.data[0]); // Pick the first one as featured
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSeries();
  }, []);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      {featured && (
        <div className="relative h-[80vh] w-full mb-12">
          <div className="absolute inset-0">
            <img 
              src={featured.bannerImage || featured.thumbnail} 
              alt={featured.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 netflix-gradient" />
          </div>
          
          <div className="absolute bottom-[20%] left-4 md:left-12 max-w-2xl z-10">
            <h1 className="text-4xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
              {featured.title}
            </h1>
            <p className="text-white text-lg md:text-xl drop-shadow-md mb-6 line-clamp-3">
              {featured.description || 'Watch this special moment again.'}
            </p>
            <div className="flex gap-4">
              <Link 
                to={`/series/${featured._id}`}
                className="bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded flex items-center gap-2 font-bold hover:bg-white/80 transition"
              >
                <Play className="w-6 h-6 fill-black" /> Play
              </Link>
              <Link to={`/series/${featured._id}`} className="bg-gray-500/70 text-white px-6 md:px-8 py-2 md:py-3 rounded flex items-center gap-2 font-bold hover:bg-gray-500/50 transition">
                <Info className="w-6 h-6" /> More Info
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Rows */}
      {series.length > 0 ? (
        <div className="-mt-32 relative z-20">
          <MediaRow title="Recently Added Series" mediaList={series} />
          {Array.from(new Set(series.flatMap(s => s.categories || [])))
            .filter(Boolean)
            .map(category => (
              <MediaRow 
                key={category} 
                title={category} 
                mediaList={series.filter(s => s.categories?.includes(category))} 
              />
          ))}
        </div>
      ) : (
        <div className="pt-32 text-center text-gray-400">
          <h2 className="text-2xl mb-4">No content found.</h2>
          <Link to="/upload" className="text-red-500 hover:underline">Upload some series to get started.</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
