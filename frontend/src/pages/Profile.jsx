import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../api/auth';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const Profile = () => {
  const { accessToken, user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [nameMsg, setNameMsg] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setNameMsg('');
    setNameLoading(true);
    try {
      const res = await updateProfile({ name }, accessToken);
      login(accessToken, { ...user, name: res.data.name });
      setNameMsg('Profile updated.');
    } catch (err) {
      setNameMsg(err.response?.data?.message || 'Update failed');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    setPwLoading(true);
    try {
      await changePassword({ currentPassword, newPassword }, accessToken);
      setPwMsg('Password changed. Please log in again next time.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="px-8 pb-10 max-w-2xl">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Profile</h1>

          <div className="bg-gradient-to-br from-orange-300 via-orange-200 to-amber-100 rounded-3xl p-6 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-semibold shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-700">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-1">Edit profile</h2>
              <p className="text-xs text-gray-400 mb-4">Update your display name.</p>
              <form onSubmit={handleNameSubmit}>
                {nameMsg && <p className="text-xs text-orange-600 mb-3">{nameMsg}</p>}
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                  required
                />
                <button type="submit" disabled={nameLoading} className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-60">
                  {nameLoading ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-1">Change password</h2>
              <p className="text-xs text-gray-400 mb-4">You'll be logged out everywhere after this.</p>
              <form onSubmit={handlePasswordSubmit}>
                {pwMsg && <p className="text-xs text-green-600 mb-3">{pwMsg}</p>}
                {pwError && <p className="text-xs text-red-500 mb-3">{pwError}</p>}

                <label className="block text-xs font-medium text-gray-500 mb-1.5">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                  required
                />

                <label className="block text-xs font-medium text-gray-500 mb-1.5">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                  required
                />

                <button type="submit" disabled={pwLoading} className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-60">
                  {pwLoading ? 'Updating...' : 'Change password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;