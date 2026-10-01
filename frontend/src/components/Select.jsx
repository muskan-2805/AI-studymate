import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({ value, onChange, options, disabled = false, size = 'md', align = 'left', className = '' }) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(Math.max(options.findIndex((o) => o.value === value), 0));
    setOpen(true);
  };

  const choose = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) return openMenu();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return openMenu();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) return openMenu();
      if (options[activeIndex]) choose(options[activeIndex]);
    }
  };

  const sizeClasses = size === 'sm' ? 'text-xs px-3 py-1' : 'text-sm px-4 py-1.5';

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-2 border border-orange-200 bg-white rounded-full text-gray-700 outline-none transition hover:border-orange-300 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
      >
        <span className="truncate max-w-[220px]">{selected?.label ?? 'Select'}</span>
        <ChevronDown size={size === 'sm' ? 12 : 14} className={`shrink-0 text-orange-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute z-30 mt-1.5 min-w-full w-max max-w-xs max-h-60 overflow-y-auto bg-white border border-orange-100 rounded-2xl shadow-lg py-1.5 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;
            const isActive = i === activeIndex;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(option)}
                className={`flex items-center justify-between gap-3 cursor-pointer px-3.5 py-2 ${size === 'sm' ? 'text-xs' : 'text-sm'} ${
                  isActive ? 'bg-orange-50' : ''
                } ${isSelected ? 'text-orange-600 font-medium' : 'text-gray-700'}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check size={14} className="shrink-0 text-orange-500" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
