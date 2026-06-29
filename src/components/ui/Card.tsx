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
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'var(--text-primary)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    },
    solid: {
      background: 'var(--bg-card-solid)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      color: 'var(--text-primary)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    },
    green: {
      background: 'rgba(21, 68, 41, 0.4)',
      border: '1px solid rgba(46, 204, 113, 0.3)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      color: 'var(--text-primary)',
      boxShadow: '0 8px 32px 0 rgba(46, 204, 113, 0.1)',
    },
    'blue-gradient': {
      background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.2), rgba(138, 43, 226, 0.2))',
      border: '1px solid rgba(138, 43, 226, 0.4)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      color: 'var(--text-primary)',
      boxShadow: '0 8px 32px 0 rgba(88, 101, 242, 0.15)',
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
