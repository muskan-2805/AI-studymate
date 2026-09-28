import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Loader2, Sparkles, HelpCircle, FileText as FileIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { askQuestion, generateQuiz, getDocuments } from '../api/documents';
import { logRevision } from '../api/revision';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DocumentView = () => {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState([]);
  const [asking, setAsking] = useState(false);

  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    getDocuments(accessToken).then((res) => {
      setDoc(res.data.find((d) => d._id === id));
    });
  }, [id]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const userMsg = question;
    setChat((prev) => [...prev, { role: 'user', text: userMsg }]);
    setQuestion('');
    setAsking(true);
    try {
      const res = await askQuestion(id, userMsg, accessToken);
      setChat((prev) => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setChat((prev) => [...prev, { role: 'ai', text: 'Something went wrong. Try again.' }]);
    } finally {
      setAsking(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setQuiz(null);
    setSubmitted(false);
    setAnswers({});
    setScore(null);
    try {
      const res = await generateQuiz(id, numQuestions, accessToken);
      setQuiz(res.data);
    } catch (err) {
      alert('Failed to generate quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectAnswer = (qIndex, optIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitQuiz = async () => {
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswerIndex) correct++;
    });
    const percent = Math.round((correct / quiz.questions.length) * 100);
    setScore(percent);
    setSubmitted(true);
    try {
      await logRevision(id, percent, accessToken);
    } catch (err) {}
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar title backTo="/dashboard" />

        <div className="px-8 pb-10">
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <FileIcon size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{doc?.title || 'Loading...'}</p>
                <p className="text-xs text-gray-400">{doc && new Date(doc.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-medium">
              {doc?.status || '...'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 space-y-5">
              <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-orange-500" />
                  <h2 className="text-sm font-semibold text-gray-800">Ask your notes</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">Get instant answers, summaries and explanations from your document.</p>

                <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                  {chat.map((msg, i) => (
                    <div
                      key={i}
                      className={`text-sm rounded-2xl px-4 py-2.5 max-w-[85%] ${
                        msg.role === 'user' ? 'bg-orange-500 text-white ml-auto' : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {asking && <div className="bg-gray-50 text-gray-400 text-sm rounded-2xl px-4 py-2.5 w-fit">Thinking...</div>}
                </div>

                <form onSubmit={handleAsk} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question about this document..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                  />
                  <button type="submit" disabled={asking} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 transition disabled:opacity-60">
                    <Send size={16} />
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-orange-500" />
                    <h2 className="text-sm font-semibold text-gray-800">Quiz yourself</h2>
                  </div>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    disabled={quizLoading}
                    className="text-xs border border-gray-200 rounded-full px-3 py-1 outline-none"
                  >
                    {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} questions</option>)}
                  </select>
                </div>
                <p className="text-xs text-gray-400 mb-4">Test what you've learned from this document.</p>

                {!quiz && (
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={quizLoading}
                    className="w-full bg-orange-400 hover:bg-orange-500 text-white font-medium py-2.5 rounded-full transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {quizLoading && <Loader2 size={14} className="animate-spin" />}
                    {quizLoading ? 'Generating...' : 'Generate Quiz'}
                  </button>
                )}

                {quiz && (
                  <div className="space-y-5">
                    {quiz.questions.map((q, qIndex) => (
                      <div key={qIndex}>
                        <p className="text-sm font-medium text-gray-800 mb-2">{qIndex + 1}. {q.question}</p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIndex) => {
                            const isSelected = answers[qIndex] === optIndex;
                            const isCorrect = optIndex === q.correctAnswerIndex;
                            let style = 'border-gray-200 hover:border-orange-200';
                            if (submitted) {
                              if (isCorrect) style = 'border-green-300 bg-green-50';
                              else if (isSelected) style = 'border-red-300 bg-red-50';
                            } else if (isSelected) style = 'border-orange-400 bg-orange-50';
                            return (
                              <button key={optIndex} onClick={() => handleSelectAnswer(qIndex, optIndex)} className={`w-full text-left text-sm border rounded-xl px-4 py-2 transition ${style}`}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {!submitted ? (
                      <button onClick={handleSubmitQuiz} disabled={Object.keys(answers).length !== quiz.questions.length} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-full transition disabled:opacity-40">
                        Submit quiz
                      </button>
                    ) : (
                      <div className="bg-orange-50 text-orange-500 text-center rounded-2xl px-4 py-3 text-sm font-medium">You scored {score}%</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-800 mb-3">Document Info</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="text-gray-700 truncate ml-2">{doc?.title}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Uploaded</span><span className="text-gray-700">{doc && new Date(doc.createdAt).toLocaleDateString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Status</span><span className="text-gray-700 capitalize">{doc?.status}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;