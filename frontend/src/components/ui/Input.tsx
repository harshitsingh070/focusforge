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
          <label htmlFor={inputId} className="text-sm font-semibold tracking-[-0.01em]" style={{ color: 'var(--ff-ui-text-soft)' }}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span
              className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
              style={{ color: 'var(--ff-ui-text-muted)' }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              input-field px-3.5 py-2.5 text-sm
              ${icon ? 'pl-10' : ''}
              ${className}
            `.trim()}
            style={error ? { borderColor: 'var(--ff-ui-danger-border)' } : undefined}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium" style={{ color: 'var(--ff-ui-danger-text)' }}>{error}</p>}
        {helperText && !error && <p className="text-xs" style={{ color: 'var(--ff-ui-text-muted)' }}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
