import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, icon, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 dark:text-slate-500">
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full appearance-none rounded-xl border bg-white dark:bg-slate-800
              py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100
              outline-none transition-all duration-200 cursor-pointer
              ${error
                ? 'border-red-400 dark:border-red-500/50 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200 dark:border-slate-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
              }
              ${icon ? 'pl-10' : 'pl-3.5'}
              ${className}
            `.trim()}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[16px] text-slate-400 dark:text-slate-500">
            expand_more
          </span>
        </div>
        {error && <p className="text-xs font-medium text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
