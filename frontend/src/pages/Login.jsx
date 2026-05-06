import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/profiles');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-black/50 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-[-1]">
        <img
          src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1600&q=80"
          alt="background"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      {/* Netflix Logo Placeholder */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <h1 className="text-red-600 text-4xl font-bold tracking-tighter">NETFLIX</h1>
      </div>

      {/* Form Container */}
      <div className="bg-black/80 p-16 rounded-md w-full max-w-md">
        <h2 className="text-3xl font-semibold mb-8">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
        {error && <p className="text-red-500 mb-4 text-sm bg-red-100/10 p-2 rounded">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email or phone number"
            className="w-full p-4 bg-[#333] rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 bg-[#333] rounded text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-red-600 py-4 rounded text-white font-semibold mt-4 hover:bg-red-700 transition">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-16 text-gray-400">
          {isLogin ? 'New to Ourflix? ' : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-white hover:underline">
            {isLogin ? 'Sign up now.' : 'Sign in.'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
