import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 dark:text-slate-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-xl border bg-white dark:bg-slate-800
              px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              outline-none transition-all duration-200
              ${error
                ? 'border-red-400 dark:border-red-500/50 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200 dark:border-slate-700 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
              }
              ${icon ? 'pl-10' : ''}
              ${className}
            `.trim()}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-red-500 dark:text-red-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
