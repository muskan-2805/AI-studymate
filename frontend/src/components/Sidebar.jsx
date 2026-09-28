import { NavLink } from 'react-router-dom';
import { BookOpen, Home, FileText, HelpCircle, MessageCircle, User } from 'lucide-react';

const navItems = [
  { label: 'Home', icon: Home, to: '/dashboard' },
  { label: 'My Documents', icon: FileText, to: '/documents' },
  { label: 'Quizzes', icon: HelpCircle, to: '/quizzes' },
  { label: 'Chat', icon: MessageCircle, to: '/chat' },
];

const Sidebar = () => {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col p-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
          <BookOpen size={16} className="text-white" strokeWidth={2} />
        </div>
        <span className="font-bold text-gray-900 text-sm">AI Study Buddy</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
              isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'
            }`
          }
        >
          <User size={17} />
          Profile
        </NavLink>
        <div className="bg-orange-50 rounded-2xl p-3 mt-3">
          <p className="text-xs text-orange-700 font-medium leading-snug">
            Small steps every day make big results.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;