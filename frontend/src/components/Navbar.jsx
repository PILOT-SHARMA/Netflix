import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { activeProfile, logout } = useContext(AuthContext);

  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-12 py-4 transition-colors duration-300 ${isScrolled ? 'bg-[#141414]' : 'bg-transparent bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center gap-8">
        <Link to="/">
          <h1 className="text-red-600 text-2xl md:text-3xl font-bold tracking-tighter">OURFLIX</h1>
        </Link>
        <ul className="hidden md:flex gap-4 text-sm text-gray-300">
          <li className="text-white font-medium cursor-pointer hover:text-gray-300 transition">Home</li>
          <li className="cursor-pointer hover:text-gray-300 transition">Movies</li>
          <li className="cursor-pointer hover:text-gray-300 transition">Series</li>
          <li className="cursor-pointer hover:text-gray-300 transition">My List</li>
          <Link to="/upload" className="cursor-pointer hover:text-white transition text-red-500 font-semibold border border-red-500 px-2 py-1 rounded">+ Upload Media</Link>
        </ul>
      </div>

      <div className="flex items-center gap-6">
        <Search className="w-5 h-5 cursor-pointer text-white" />
        <Bell className="w-5 h-5 cursor-pointer text-white hidden md:block" />
        <div className="flex items-center gap-2 cursor-pointer group relative">
          <img 
            src={activeProfile?.avatar || 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'} 
            alt="profile" 
            className="w-8 h-8 rounded"
          />
          <ChevronDown className="w-4 h-4 text-white group-hover:rotate-180 transition duration-300" />
          
          <div className="absolute top-full right-0 mt-2 w-32 bg-black/90 border border-gray-800 rounded hidden group-hover:flex flex-col py-2">
            <button onClick={logout} className="text-sm text-white hover:underline text-left px-4 py-2">Sign out</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
