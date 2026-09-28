import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.accessToken, { id: res.data._id, name: res.data.name, email: res.data.email });
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        navigate('/verify-otp', { state: { email: err.response.data.email } });
        return;
      }
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 grid grid-cols-2 overflow-hidden">

        {/* Form side */}
        <div className="p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <BookOpen size={16} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-base font-bold text-gray-900">AI Study Buddy</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back!</h1>
          <p className="text-sm text-gray-400 mb-6">We're glad to see you again! Please enter your details</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-2 mb-4">{error}</div>}

            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email *</label>
            <div className="relative mb-4">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                required
              />
            </div>

            <label className="block text-xs font-medium text-gray-500 mb-1.5">Password *</label>
            <div className="relative mb-3">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-11 pr-11 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="text-right mb-5">
              <Link to="/forgot-password" className="text-xs text-gray-700 font-medium hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2.5 rounded-xl transition disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gray-900 font-medium hover:underline">Sign up</Link>
          </p>
        </div>

        {/* Visual side */}
        <div className="relative bg-gradient-to-br from-orange-300 via-orange-200 to-amber-100 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
            Study smarter,<br />not longer.
          </h2>
          <p className="text-gray-700 text-sm max-w-[240px]">
            Upload your notes and let AI turn them into answers, quizzes and a study plan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;