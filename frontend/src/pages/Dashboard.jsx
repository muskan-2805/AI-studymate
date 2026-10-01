import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, MessageCircle, HelpCircle, ChevronRight, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { uploadDocument, getDocuments } from '../api/documents';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const Dashboard = () => {
  const { accessToken, user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments(accessToken);
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const hasProcessing = documents.some((d) => d.status === 'processing');
  useEffect(() => {
    if (!hasProcessing) return;
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, [hasProcessing]);

  const doUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    try {
      await uploadDocument(formData, accessToken);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      ready: 'bg-green-50 text-green-600',
      processing: 'bg-amber-50 text-amber-600',
      failed: 'bg-red-50 text-red-600',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || styles.processing}`}>
        {status}
      </span>
    );
  };

  const formatDate = (d) => {
    const days = Math.floor((Date.now() - new Date(d)) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar />

        <div className="px-8 pb-10">
          <div className="bg-gradient-to-br from-orange-300 via-orange-200 to-amber-100 rounded-3xl px-8 py-8 mb-6">
            <p className="text-gray-700 text-sm mb-1">Hello, {user?.name?.split(' ')[0] || ''} 👋</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AI Study Buddy</h1>
            <p className="text-gray-700 text-sm">Upload your notes, ask questions, take quizzes and study smarter with AI.</p>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-8">
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); doUpload(e.dataTransfer.files[0]); }}
              className={`col-span-2 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl py-10 cursor-pointer transition bg-white ${
                dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <input type="file" accept="application/pdf" onChange={(e) => doUpload(e.target.files[0])} disabled={uploading} className="hidden" />
              <Upload size={26} className="text-orange-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">
                {uploading ? 'Uploading...' : 'Drag & drop your PDF here'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                or <span className="text-orange-500 font-medium">click to browse files</span>
              </p>
              <p className="text-xs text-gray-300 mt-2">Supports PDF files up to 10MB</p>
            </label>

            <div className="bg-white rounded-3xl p-5 border border-gray-100">
              <p className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</p>
              <div className="space-y-2">
                <div onClick={() => navigate('/chat')} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <MessageCircle size={15} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Ask your notes</p>
                      <p className="text-[11px] text-gray-400">Get instant answers</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
                <div onClick={() => navigate('/quizzes')} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <HelpCircle size={15} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Take a quiz</p>
                      <p className="text-[11px] text-gray-400">Test your understanding</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-sm font-semibold text-gray-800 mb-4">Recent Documents</h2>

          {documents.length === 0 ? (
            <p className="text-sm text-gray-400">No documents yet. Upload one to get started.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {documents.slice(0, 8).map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => doc.status === 'ready' && navigate(`/document/${doc._id}`)}
                  className={`bg-white rounded-2xl border border-gray-100 p-4 transition ${
                    doc.status === 'ready' ? 'hover:shadow-sm hover:border-orange-200 cursor-pointer' : 'opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                      <FileText size={16} className="text-red-400" />
                    </div>
                    <MoreVertical size={14} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate mb-1">{doc.title}</p>
                  <p className="text-xs text-gray-400 mb-3">Uploaded {formatDate(doc.createdAt)}</p>
                  {statusBadge(doc.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;