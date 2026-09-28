import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HelpCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getQuizById } from '../api/documents';
import { getAllRevisionLogs } from '../api/revision';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const QuizDetail = () => {
  const { quizId } = useParams();
  const { accessToken } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dueInfo, setDueInfo] = useState(null);

  useEffect(() => {
    getQuizById(quizId, accessToken)
      .then((res) => setQuiz(res.data))
      .finally(() => setLoading(false));
  }, [quizId]);

  useEffect(() => {
    if (!quiz?.document?._id) return;
    getAllRevisionLogs(accessToken)
      .then((res) => {
        const match = res.data.find((log) => log.document?._id === quiz.document._id);
        setDueInfo(match || null);
      })
      .catch(() => {});
  }, [quiz]);

  const revisionLabel = (log) => {
    const days = Math.floor((new Date(log.nextRevisionDate) - Date.now()) / 86400000);
    if (days < 0) return { text: `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} overdue`, style: 'bg-orange-50 text-orange-600' };
    if (days === 0) return { text: 'due today', style: 'bg-orange-50 text-orange-600' };
    if (days === 1) return { text: 'scheduled for tomorrow', style: 'bg-blue-50 text-blue-600' };
    return { text: `scheduled for ${new Date(log.nextRevisionDate).toLocaleDateString()}`, style: 'bg-blue-50 text-blue-600' };
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar title backTo="/quizzes" />
        <div className="px-8 pb-10 max-w-2xl">
          {loading ? (
            <p className="text-sm text-gray-400">Loading quiz...</p>
          ) : !quiz ? (
            <p className="text-sm text-gray-400">Quiz not found.</p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <HelpCircle size={18} className="text-orange-500" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{quiz.document?.title || 'Quiz'}</h1>
                  <p className="text-xs text-gray-400">{quiz.questions.length} questions · generated {new Date(quiz.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {dueInfo && (() => {
                const { text, style } = revisionLabel(dueInfo);
                return (
                  <div className={`flex items-center gap-2 text-sm rounded-2xl px-4 py-3 mb-5 font-medium ${style}`}>
                    <Clock size={15} />
                    This document is {text} for revision (last score {dueInfo.lastScore}%). Retake the quiz on the document page to log a fresh score.
                  </div>
                );
              })()}

              <div className="space-y-5">
                {quiz.questions.map((q, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-sm font-medium text-gray-800 mb-3">{i + 1}. {q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIndex) => (
                        <div
                          key={optIndex}
                          className={`text-sm rounded-xl px-4 py-2 border ${
                            optIndex === q.correctAnswerIndex
                              ? 'border-green-300 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;