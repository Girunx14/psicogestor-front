import { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { Clock, ChevronDown, X } from 'lucide-react';

interface TimePickerProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  ({ label, error, value, onChange }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const hours: string[] = [];
    for (let h = 7; h <= 19; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < 19) {
        hours.push(`${h.toString().padStart(2, '0')}:30`);
      }
    }

    const handleSelect = (hour: string) => {
      onChange?.(hour);
      setIsOpen(false);
    };

    const displayValue = value ? value.slice(0, 5) : '';

    return (
      <div ref={ref} className="w-full">
        {label && (
          <label className="block text-xs font-medium text-secondary-500 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none z-10">
            <Clock size={16} />
          </div>
          <div
            className={clsx(
              'w-full pl-9 pr-8 py-2.5 border rounded-lg text-sm bg-white cursor-pointer transition-colors',
              error ? 'border-red-300' : 'border-[#c4c6cf]',
              isOpen && 'border-[#1A365D] ring-1 ring-[#1A365D]'
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {displayValue || 'Selecciona una hora'}
          </div>
          {displayValue && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.('');
              }}
            >
              <X size={14} />
            </button>
          )}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none">
            <ChevronDown size={16} className={clsx('transition-transform', isOpen && 'rotate-180')} />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-[100] mt-1 w-full bg-white border border-[#c4c6cf] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {hours.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(hour);
                  }}
                  className={clsx(
                    'w-full px-3 py-2 text-sm text-left transition-colors',
                    value === hour
                      ? 'bg-[#1A365D] text-white'
                      : 'hover:bg-[#e5eeff] text-gray-700'
                  )}
                >
                  {hour.slice(0, 5)}
                </button>
              ))}
            </div>
          </div>
        )}

        {isOpen && (
          <div
            className="fixed inset-0 z-[99]"
            onClick={() => setIsOpen(false)}
          />
        )}

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';

export default TimePicker;