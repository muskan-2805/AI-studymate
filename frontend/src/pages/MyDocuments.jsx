import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDocuments, deleteDocument } from '../api/documents';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const MyDocuments = () => {
  const { accessToken } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchDocuments = () => {
    getDocuments(accessToken).then((res) => setDocuments(res.data));
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (e, doc) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Delete "${doc.title}"? This will also delete any quizzes and revision history for this document. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(doc._id);
    try {
      await deleteDocument(doc._id, accessToken);
      setDocuments((prev) => prev.filter((d) => d._id !== doc._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeletingId(null);
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

  const filtered = documents.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar onSearch={setSearch} />
        <div className="px-8 pb-10">
          <h1 className="text-xl font-bold text-gray-900 mb-6">My Documents</h1>

          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400">No documents found.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filtered.map((doc) => (
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
                    <button
                      onClick={(e) => handleDelete(e, doc)}
                      disabled={deletingId === doc._id}
                      className="text-gray-300 hover:text-red-500 transition disabled:opacity-40"
                      title="Delete document"
                    >
                      <Trash2 size={15} />
                    </button>
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

export default MyDocuments;