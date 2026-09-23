import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../api/auth';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 grid grid-cols-2 overflow-hidden">

        <div className="p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <BookOpen size={16} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-base font-bold text-gray-900">AI Study Buddy</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an account.</h1>
          <p className="text-sm text-gray-400 mb-6">Sign up to start studying smarter with AI.</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-2 mb-4">{error}</div>}

            <label className="block text-xs font-medium text-gray-500 mb-1.5">Full name *</label>
            <div className="relative mb-4">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                required
              />
            </div>

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
            <div className="relative mb-5">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="w-full border border-gray-200 rounded-xl pl-11 pr-11 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2.5 rounded-xl transition disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-900 font-medium hover:underline">Log in</Link>
          </p>
        </div>

        <div className="relative bg-gradient-to-br from-orange-300 via-orange-200 to-amber-100 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
            Your notes,<br />reimagined.
          </h2>
          <p className="text-gray-700 text-sm max-w-[240px]">
            Join AI Study Buddy and turn every PDF into instant answers and quizzes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;