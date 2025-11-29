import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:pointer-events-none active:scale-95 duration-200";
  
  const variants = {
    // Gradient Purple to Red for primary actions
    primary: "bg-gradient-to-r from-purple-700 to-red-600 text-white hover:from-purple-600 hover:to-red-500 shadow-lg shadow-purple-900/20 hover:shadow-purple-700/40 border border-transparent",
    // Dark Zinc for secondary
    secondary: "bg-zinc-800 text-gray-200 hover:bg-zinc-700 hover:text-white border border-zinc-700",
    // Red for danger
    danger: "bg-red-900/50 text-red-200 hover:bg-red-800 hover:text-white border border-red-800",
    // Outline with Gold hover
    outline: "border border-zinc-700 bg-transparent text-gray-400 hover:text-amber-400 hover:border-amber-400/50 hover:bg-zinc-900"
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};