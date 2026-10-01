import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { verifyOtp as verifyOtpApi, resendOtp } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('No email found. Please register again.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtpApi({ email, otp });
      login(res.data.accessToken, { id: res.data._id, name: res.data.name, email: res.data.email });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('No email found. Please log in again.');
      return;
    }
    setResending(true);
    try {
      await resendOtp({ email });
      setInfo('A new code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend the code');
    } finally {
      setResending(false);
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

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify your email.</h1>
          <p className="text-sm text-gray-400 mb-6">
            {email ? `Enter the code we sent to ${email}.` : 'Enter the code sent to your email.'}
          </p>

          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-2 mb-4">{error}</div>}
            {info && <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-2 mb-4">{info}</div>}

            <label className="block text-xs font-medium text-gray-500 mb-1.5">6-digit code *</label>
            <input
              type="text"
              placeholder="Enter the code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-5 text-center tracking-[0.5em] outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
              required
            />

            <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2.5 rounded-xl transition disabled:opacity-60">
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Didn't get a code?{' '}
            <button type="button" onClick={handleResend} disabled={resending} className="text-gray-900 font-medium hover:underline disabled:opacity-60">
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            Wrong email?{' '}
            <Link to="/register" className="text-gray-900 font-medium hover:underline">Go back</Link>
          </p>
        </div>

        <div className="relative bg-gradient-to-br from-orange-300 via-orange-200 to-amber-100 p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-900 leading-snug mb-3">One last<br />step.</h2>
          <p className="text-gray-700 text-sm max-w-[240px]">
            Verify your email to unlock your notes, quizzes and answers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;