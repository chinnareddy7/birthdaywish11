import React from 'react';
import { ChevronLeft } from 'lucide-react';
import './PreviousButton.css';

interface PreviousButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export default function PreviousButton({
  onClick,
  label = 'Previous',
  className = '',
  style,
  ariaLabel = 'Go to previous page',
}: PreviousButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`btn-previous-global ${className}`}
      style={style}
    >
      <ChevronLeft size={16} strokeWidth={2.5} className="btn-previous-icon" />
      <span className="btn-previous-text">{label}</span>
    </button>
  );
}
