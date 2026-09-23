import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BookOpen, Lock, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../api/auth';

const ResetPassword = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('No email found. Please start over.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
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

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset password.</h1>
          <p className="text-sm text-gray-400 mb-6">
            {email ? `Enter the code sent to ${email} and choose a new password.` : 'Enter the code and your new password.'}
          </p>

          {success ? (
            <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-3 text-center">
              Password reset! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-2 mb-4">{error}</div>}

              <label className="block text-xs font-medium text-gray-500 mb-1.5">6-digit code *</label>
              <input
                type="text"
                placeholder="Enter the code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 text-center tracking-[0.5em] outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                required
              />

              <label className="block text-xs font-medium text-gray-500 mb-1.5">New password *</label>
              <div className="relative mb-5">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link to="/login" className="text-gray-900 font-medium hover:underline">Back to login</Link>
          </p>
        </div>

        <div className="relative bg-gradient-to-br from-orange-300 via-orange-200 to-amber-100 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
            Almost<br />there.
          </h2>
          <p className="text-gray-700 text-sm max-w-[240px]">
            Set a new password and get right back to your notes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;