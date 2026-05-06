import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import axios from 'axios';

const ProfileSelection = () => {
  const { user, setActiveProfile, token, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isManaging, setIsManaging] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAvatar, setNewProfileAvatar] = useState('');

  const handleProfileSelect = (profile) => {
    if (isManaging) {
      setEditingProfile(profile);
      setNewProfileName(profile.name);
      setNewProfileAvatar(profile.avatar);
    } else {
      setActiveProfile(profile);
      navigate('/');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingProfile._id) { // Existing profile
        const res = await axios.put(`http://localhost:5001/api/profiles/${editingProfile._id}`, {
          name: newProfileName,
          avatar: newProfileAvatar
        }, config);
        setUser({ ...user, profiles: res.data });
      } else { // New profile
        const res = await axios.post('http://localhost:5001/api/profiles', {
          name: newProfileName,
          avatar: newProfileAvatar || 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
        }, config);
        setUser({ ...user, profiles: res.data });
      }
      setEditingProfile(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      if (editingProfile._id) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.delete(`http://localhost:5001/api/profiles/${editingProfile._id}`, config);
        setUser({ ...user, profiles: res.data });
      }
      setEditingProfile(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  if (editingProfile) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl md:text-5xl font-semibold mb-10">{editingProfile._id ? 'Edit Profile' : 'Add Profile'}</h1>
        <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-900 p-8 rounded-lg">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden border-2 border-transparent">
            <img 
              src={newProfileAvatar || 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'} 
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <input 
              type="text" 
              value={newProfileName} 
              onChange={(e) => setNewProfileName(e.target.value)} 
              className="bg-gray-800 text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Profile Name"
            />
            <input 
              type="text" 
              value={newProfileAvatar} 
              onChange={(e) => setNewProfileAvatar(e.target.value)} 
              className="bg-gray-800 text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="Avatar URL"
            />
          </div>
        </div>
        <div className="mt-8 flex gap-4">
          <button 
            onClick={handleSaveProfile}
            className="bg-white text-black font-bold px-6 py-2 rounded hover:bg-gray-300 transition"
          >
            Save
          </button>
          <button 
            onClick={() => setEditingProfile(null)}
            className="border border-gray-500 text-gray-500 hover:text-white hover:border-white px-6 py-2 rounded transition"
          >
            Cancel
          </button>
          {editingProfile._id && (
            <button 
              onClick={handleDeleteProfile}
              className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2 rounded transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <h1 className="text-red-600 text-4xl font-bold tracking-tighter">OURFLIX</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl text-white font-semibold mb-10">
          {isManaging ? 'Manage Profiles:' : "Who's watching?"}
        </h1>
        <div className="flex justify-center gap-6 flex-wrap">
          {user.profiles.map((profile, idx) => (
            <div 
              key={profile._id || idx} 
              className="group flex flex-col items-center cursor-pointer relative"
              onClick={() => handleProfileSelect(profile)}
            >
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden border-2 ${isManaging ? 'border-gray-500 group-hover:border-white' : 'border-transparent group-hover:border-white'} transition duration-300 relative`}>
                <img 
                  src={profile.avatar || 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'} 
                  alt={profile.name}
                  className={`w-full h-full object-cover ${isManaging ? 'opacity-50 group-hover:opacity-75 transition duration-300' : ''}`}
                />
                {isManaging && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white rounded-full p-2 bg-black bg-opacity-50">
                      <Pencil className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <span className={`mt-4 text-xl transition duration-300 ${isManaging ? 'text-gray-500 group-hover:text-white' : 'text-gray-400 group-hover:text-white'}`}>
                {profile.name}
              </span>
            </div>
          ))}
          {/* Add Profile Button */}
          {user.profiles.length < 5 && (
            <div 
              className="group flex flex-col items-center cursor-pointer"
              onClick={() => isManaging ? handleProfileSelect({ name: '', avatar: '' }) : null}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden border-2 border-transparent group-hover:border-white group-hover:bg-white flex items-center justify-center transition duration-300 bg-gray-800">
                <span className="text-5xl text-gray-400 group-hover:text-black transition duration-300">+</span>
              </div>
              <span className="mt-4 text-gray-400 group-hover:text-white transition duration-300 text-xl">
                Add Profile
              </span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsManaging(!isManaging)}
          className={`mt-16 border px-6 py-2 tracking-widest uppercase transition duration-300 ${isManaging ? 'bg-white text-black hover:bg-gray-200' : 'border-gray-500 text-gray-500 hover:text-white hover:border-white'}`}
        >
          {isManaging ? 'Done' : 'Manage Profiles'}
        </button>
      </motion.div>
    </div>
  );
};

export default ProfileSelection;
