import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  fullWidth = false, 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 24px',
    borderRadius: 'var(--radius-lg)',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
  };

  const variants = {
    primary: {
      background: 'var(--gradient-primary)',
      color: '#fff',
      boxShadow: '0 4px 15px rgba(138, 43, 226, 0.3)',
    },
    secondary: {
      background: 'var(--bg-card)',
      color: '#fff',
      border: '1px solid var(--border-color)',
    },
    success: {
      background: 'var(--accent-green)',
      color: '#000',
    },
    outline: {
      background: 'transparent',
      color: 'var(--accent-green)',
      border: '1px solid var(--accent-green)',
    }
  };

  return (
    <button 
      style={{ ...baseStyles, ...variants[variant] }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};
