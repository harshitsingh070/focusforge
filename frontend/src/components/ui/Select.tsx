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
          <label htmlFor={selectId} className="text-sm font-semibold tracking-[-0.01em]" style={{ color: 'var(--ff-ui-text-soft)' }}>
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
          <select
            ref={ref}
            id={selectId}
            className={`
              select-field w-full cursor-pointer appearance-none py-2.5 pr-10 text-sm
              ${icon ? 'pl-10' : 'pl-3.5'}
              ${className}
            `.trim()}
            style={error ? { borderColor: 'var(--ff-ui-danger-border)' } : undefined}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[16px]"
            style={{ color: 'var(--ff-ui-text-muted)' }}
          >
            expand_more
          </span>
        </div>
        {error && <p className="text-xs font-medium" style={{ color: 'var(--ff-ui-danger-text)' }}>{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
