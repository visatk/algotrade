import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'green' | 'blue-gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'glass',
  padding = 'md',
  className = '',
  style,
  ...props 
}) => {
  const paddings = {
    none: '0',
    sm: '12px',
    md: '16px 20px',
    lg: '24px',
  };

  const variants = {
    glass: {
      background: 'var(--bg-card)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-primary)',
    },
    solid: {
      background: 'var(--bg-card-solid)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-primary)',
    },
    green: {
      background: 'rgba(21, 68, 41, 0.6)',
      border: '1px solid rgba(46, 204, 113, 0.2)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: 'var(--text-primary)',
    },
    'blue-gradient': {
      background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.2), rgba(138, 43, 226, 0.2))',
      border: '1px solid rgba(138, 43, 226, 0.3)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: 'var(--text-primary)',
    }
  };

  const baseStyles: React.CSSProperties = {
    borderRadius: 'var(--radius-md)',
    padding: paddings[padding],
    ...variants[variant],
    ...style,
  };

  return (
    <div style={baseStyles} className={className} {...props}>
      {children}
    </div>
  );
};
