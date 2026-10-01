import { useState, useEffect } from 'react';
import { Send, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDocuments, askQuestion } from '../api/documents';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const Chat = () => {
  const { accessToken } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState([]);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    getDocuments(accessToken).then((res) => {
      const ready = res.data.filter((d) => d.status === 'ready');
      setDocuments(ready);
      if (ready.length > 0) setSelectedDoc(ready[0]._id);
    });
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || !selectedDoc) return;
    const userMsg = question;
    setChat((prev) => [...prev, { role: 'user', text: userMsg }]);
    setQuestion('');
    setAsking(true);
    try {
      const res = await askQuestion(selectedDoc, userMsg, accessToken);
      setChat((prev) => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch (err) {
      setChat((prev) => [...prev, { role: 'ai', text: err.response?.data?.message || 'Something went wrong. Try again.' }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="px-8 pb-10">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Chat</h1>

          {documents.length === 0 ? (
            <p className="text-sm text-gray-400">Upload a document first to start chatting.</p>
          ) : (
            <div className="bg-white rounded-3xl border border-orange-300 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={15} className="text-orange-400" />
                <select
                  value={selectedDoc || ''}
                  onChange={(e) => { setSelectedDoc(e.target.value); setChat([]); }}
                  className="text-sm border border-orange-200 rounded-full px-4 py-1.5 outline-none"
                >
                  {documents.map((d) => (
                    <option key={d._id} value={d._id}>{d.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 mb-4 min-h-[280px] max-h-96 overflow-y-auto">
                {chat.length === 0 && <p className="text-sm text-gray-400">Ask anything about this document.</p>}
                {chat.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm rounded-2xl px-4 py-2.5 max-w-[85%] ${
                      msg.role === 'user' ? 'bg-gray-900 text-white ml-auto' : 'bg-gray-50 text-gray-700'
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
                  placeholder="Ask a question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition"
                />
                <button type="submit" disabled={asking} className="bg-gray-900 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0 transition disabled:opacity-60">
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;