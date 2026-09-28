import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getQuizzes, deleteQuiz } from '../api/documents';
import { getAllRevisionLogs } from '../api/revision';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const Quizzes = () => {
  const { accessToken } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [dueMap, setDueMap] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getQuizzes(accessToken).then((res) => setQuizzes(res.data));
    getAllRevisionLogs(accessToken).then((res) => {
      const map = {};
      res.data.forEach((log) => {
        if (log.document?._id) map[log.document._id] = log;
      });
      setDueMap(map);
    }).catch(() => {});
  }, []);

  const revisionLabel = (log) => {
    const days = Math.floor((new Date(log.nextRevisionDate) - Date.now()) / 86400000);
    if (days < 0) return { text: `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue`, style: 'bg-orange-50 text-orange-600' };
    if (days === 0) return { text: 'Due today', style: 'bg-orange-50 text-orange-600' };
    if (days === 1) return { text: 'Scheduled for tomorrow', style: 'bg-blue-50 text-blue-600' };
    return { text: `Scheduled for ${new Date(log.nextRevisionDate).toLocaleDateString()}`, style: 'bg-blue-50 text-blue-600' };
  };

  const handleDelete = async (e, quiz) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Delete this quiz on "${quiz.document?.title || 'this document'}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(quiz._id);
    try {
      await deleteQuiz(quiz._id, accessToken);
      setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete quiz');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="px-8 pb-10">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Quizzes</h1>

          {quizzes.length === 0 ? (
            <p className="text-sm text-gray-400">No quizzes generated yet. Open a document to create one.</p>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => {
                const due = dueMap[quiz.document?._id];
                const isDueNow = due && new Date(due.nextRevisionDate) <= new Date();
                return (
                  <div
                    key={quiz._id}
                    onClick={() => navigate(`/quizzes/${quiz._id}`)}
                    className={`bg-white rounded-2xl border px-5 py-4 flex items-center justify-between hover:shadow-sm cursor-pointer transition ${
                      isDueNow ? 'border-orange-300' : 'border-gray-100 hover:border-orange-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                        <HelpCircle size={16} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{quiz.document?.title || 'Untitled document'}</p>
                        <p className="text-xs text-gray-400">{quiz.questions.length} questions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {due && (() => {
                        const { text, style } = revisionLabel(due);
                        return (
                          <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${style}`}>
                            <Clock size={12} />
                            {text} · last {due.lastScore}%
                          </span>
                        );
                      })()}
                      <span className="text-xs text-gray-400">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, quiz)}
                        disabled={deletingId === quiz._id}
                        className="text-gray-300 hover:text-red-500 transition disabled:opacity-40"
                        title="Delete quiz"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quizzes;