import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const MediaRow = ({ title, mediaList }) => {
  const rowRef = useRef(null);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!mediaList || mediaList.length === 0) return null;

  return (
    <div className="mb-8 group relative px-4 md:px-12">
      <h2 className="text-xl md:text-2xl font-bold text-[#e5e5e5] mb-4 group-hover:text-white transition cursor-pointer">
        {title}
      </h2>
      <div className="relative">
        <ChevronLeft 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white z-10 cursor-pointer opacity-0 group-hover:opacity-100 transition hover:scale-110"
          onClick={() => handleScroll('left')}
        />
        
        <div 
          ref={rowRef} 
          className="flex gap-2 overflow-x-scroll hide-scrollbar scroll-smooth relative"
        >
          {mediaList.map((media) => (
            <Link 
              to={`/series/${media._id}`} 
              key={media._id}
              className="relative min-w-[200px] md:min-w-[280px] h-[112px] md:h-[157px] rounded overflow-hidden cursor-pointer transition duration-300 transform hover:scale-105 hover:z-20 origin-center"
            >
              <img 
                src={media.thumbnail} 
                alt={media.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/60 transition duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <Play className="w-12 h-12 text-white" />
              </div>
              <div className="absolute bottom-2 left-2 right-2 opacity-0 hover:opacity-100 transition duration-300 pointer-events-none">
                <p className="text-white text-sm font-semibold truncate shadow-black drop-shadow-md">{media.title}</p>
              </div>
            </Link>
          ))}
        </div>

        <ChevronRight 
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white z-10 cursor-pointer opacity-0 group-hover:opacity-100 transition hover:scale-110"
          onClick={() => handleScroll('right')}
        />
      </div>
    </div>
  );
};

export default MediaRow;
