import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Upload = () => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('series');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Data
  const [allSeries, setAllSeries] = useState([]);
  const [seasonsForSeries, setSeasonsForSeries] = useState([]);

  // Forms State
  const [seriesForm, setSeriesForm] = useState({ title: '', description: '', categories: '', bannerImage: null, thumbnail: null });
  const [seasonForm, setSeasonForm] = useState({ seriesId: '', seasonNumber: '' });
  const [episodeForm, setEpisodeForm] = useState({ seasonId: '', episodeNumber: '', title: '', description: '', duration: '', video: null, thumbnail: null });

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/content/series');
      setAllSeries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSeasonsForSeries = async (seriesId) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/content/series/${seriesId}`);
      if (res.data.seasons) {
        setSeasonsForSeries(res.data.seasons);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeriesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', seriesForm.title);
    formData.append('description', seriesForm.description);
    formData.append('categories', seriesForm.categories);
    if (seriesForm.bannerImage) formData.append('bannerImage', seriesForm.bannerImage);
    if (seriesForm.thumbnail) formData.append('thumbnail', seriesForm.thumbnail);

    try {
      await axios.post('http://localhost:5001/api/content/series', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      alert('Series Created Successfully!');
      setSeriesForm({ title: '', description: '', categories: '', bannerImage: null, thumbnail: null });
      fetchSeries();
    } catch (err) {
      console.error(err);
      alert('Error creating series');
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/content/seasons', seasonForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Season Added Successfully!');
      setSeasonForm({ seriesId: seasonForm.seriesId, seasonNumber: '' });
      if (episodeForm.seriesId === seasonForm.seriesId) {
        fetchSeasonsForSeries(seasonForm.seriesId);
      }
    } catch (err) {
      console.error(err);
      alert('Error adding season');
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('seasonId', episodeForm.seasonId);
    formData.append('episodeNumber', episodeForm.episodeNumber);
    formData.append('title', episodeForm.title);
    formData.append('description', episodeForm.description);
    formData.append('duration', episodeForm.duration);
    if (episodeForm.video) formData.append('video', episodeForm.video);
    if (episodeForm.thumbnail) formData.append('thumbnail', episodeForm.thumbnail);

    try {
      await axios.post('http://localhost:5001/api/content/episodes', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      alert('Episode Added Successfully!');
      setEpisodeForm({ ...episodeForm, episodeNumber: '', title: '', description: '', duration: '', video: null, thumbnail: null });
    } catch (err) {
      console.error(err);
      alert('Error adding episode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 px-4 min-h-screen pb-12 bg-[#141414] text-white flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="flex gap-4 mb-8 bg-gray-900 p-2 rounded-lg">
        <button 
          onClick={() => setActiveTab('series')}
          className={`px-6 py-2 rounded font-bold transition ${activeTab === 'series' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Create Series
        </button>
        <button 
          onClick={() => setActiveTab('season')}
          className={`px-6 py-2 rounded font-bold transition ${activeTab === 'season' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Add Season
        </button>
        <button 
          onClick={() => setActiveTab('episode')}
          className={`px-6 py-2 rounded font-bold transition ${activeTab === 'episode' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Add Episode
        </button>
      </div>

      <div className="bg-black/80 p-8 rounded border border-gray-800 w-full max-w-3xl">
        {/* SERIES TAB */}
        {activeTab === 'series' && (
          <form onSubmit={handleSeriesSubmit} className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold mb-4">Create New Series</h2>
            <div>
              <label className="block text-gray-400 mb-2">Title</label>
              <input type="text" required value={seriesForm.title} onChange={(e) => setSeriesForm({...seriesForm, title: e.target.value})} className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white" />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Description</label>
              <textarea required value={seriesForm.description} onChange={(e) => setSeriesForm({...seriesForm, description: e.target.value})} className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white h-32" />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Categories (comma separated)</label>
              <input type="text" value={seriesForm.categories} onChange={(e) => setSeriesForm({...seriesForm, categories: e.target.value})} placeholder="e.g. Memories, Trips, Romantic" className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white" />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Banner Image</label>
              <input type="file" accept="image/*" onChange={(e) => setSeriesForm({...seriesForm, bannerImage: e.target.files[0]})} className="w-full bg-[#333] p-3 rounded text-gray-400" />
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Thumbnail Image</label>
              <input type="file" accept="image/*" onChange={(e) => setSeriesForm({...seriesForm, thumbnail: e.target.files[0]})} className="w-full bg-[#333] p-3 rounded text-gray-400" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-red-600 py-3 rounded text-white font-bold hover:bg-red-700 transition mt-4 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Series'}
            </button>
          </form>
        )}

        {/* SEASON TAB */}
        {activeTab === 'season' && (
          <form onSubmit={handleSeasonSubmit} className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold mb-4">Add Season to Series</h2>
            <div>
              <label className="block text-gray-400 mb-2">Select Series</label>
              <select required value={seasonForm.seriesId} onChange={(e) => setSeasonForm({...seasonForm, seriesId: e.target.value})} className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white">
                <option value="">-- Select a Series --</option>
                {allSeries.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Season Number</label>
              <input type="number" min="1" required value={seasonForm.seasonNumber} onChange={(e) => setSeasonForm({...seasonForm, seasonNumber: e.target.value})} className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-red-600 py-3 rounded text-white font-bold hover:bg-red-700 transition mt-4 disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Season'}
            </button>
          </form>
        )}

        {/* EPISODE TAB */}
        {activeTab === 'episode' && (
          <form onSubmit={handleEpisodeSubmit} className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold mb-4">Upload Episode</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-400 mb-2">Select Series</label>
                <select required onChange={(e) => fetchSeasonsForSeries(e.target.value)} className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white">
                  <option value="">-- Select a Series --</option>
                  {allSeries.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-400 mb-2">Select Season</label>
                <select required value={episodeForm.seasonId} onChange={(e) => setEpisodeForm({...episodeForm, seasonId: e.target.value})} className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white">
                  <option value="">-- Select a Season --</option>
                  {seasonsForSeries.map(s => <option key={s._id} value={s._id}>Season {s.seasonNumber}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-400 mb-2">Episode Number</label>
                <input type="number" min="1" required value={episodeForm.episodeNumber} onChange={(e) => setEpisodeForm({...episodeForm, episodeNumber: e.target.value})} className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white" />
              </div>
              <div className="flex-1">
                <label className="block text-gray-400 mb-2">Duration (mins)</label>
                <input type="number" min="1" required value={episodeForm.duration} onChange={(e) => setEpisodeForm({...episodeForm, duration: e.target.value})} className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Episode Title</label>
              <input type="text" required value={episodeForm.title} onChange={(e) => setEpisodeForm({...episodeForm, title: e.target.value})} className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white" />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Description</label>
              <textarea required value={episodeForm.description} onChange={(e) => setEpisodeForm({...episodeForm, description: e.target.value})} className="w-full bg-[#333] p-3 rounded focus:outline-none focus:ring-1 focus:ring-white h-24" />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Thumbnail Image</label>
              <input type="file" accept="image/*" onChange={(e) => setEpisodeForm({...episodeForm, thumbnail: e.target.files[0]})} className="w-full bg-[#333] p-3 rounded text-gray-400" />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Video File</label>
              <input type="file" accept="video/*" required onChange={(e) => setEpisodeForm({...episodeForm, video: e.target.files[0]})} className="w-full bg-[#333] p-3 rounded text-gray-400" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-red-600 py-3 rounded text-white font-bold hover:bg-red-700 transition mt-4 disabled:opacity-50">
              {loading ? 'Uploading...' : 'Upload Episode'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Upload;
