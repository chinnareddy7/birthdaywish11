import { useState } from 'react';
import './HeartIntro.css';

interface HeartIntroProps {
  onContinue: () => void;
}

export default function HeartIntro({ onContinue }: HeartIntroProps) {
  const [clicked, setClicked] = useState(false);

  const handleHeartClick = () => {
    if (clicked) return;

    setClicked(true);

    setTimeout(() => {
      onContinue();
    }, 1500); // Wait for unlock transition to finish
  };

  return (
    <div className={`hi-container ${clicked ? 'hi-clicked' : ''}`}>
      {/* Background Ambient Glows */}
      <div className="hi-bg-glow hi-glow-1" />
      <div className="hi-bg-glow hi-glow-2" />
      
      {/* Subtle floating background particles */}
      <div className="hi-particle hi-p-1">❤</div>
      <div className="hi-particle hi-p-2">❤</div>
      <div className="hi-particle hi-p-3" />
      <div className="hi-particle hi-p-4" />

      {/* Burst Particles (only active on click) */}
      {clicked && (
        <>
          <div className="hi-burst-particle hi-bp-1">❤</div>
          <div className="hi-burst-particle hi-bp-2">❤</div>
          <div className="hi-burst-particle hi-bp-3">❤</div>
          <div className="hi-burst-particle hi-bp-4">❤</div>
          <div className="hi-burst-particle hi-bp-5">✨</div>
          <div className="hi-burst-particle hi-bp-6">✨</div>
        </>
      )}

      <div className="hi-content">
        <h2 className="hi-top-text">a little something for you</h2>

        <button 
          type="button"
          className="hi-heart-btn" 
          onClick={handleHeartClick}
          aria-label="Tap the heart"
        >
          <div className="hi-heart-wrapper">
            <div className="hi-heart-glow" />
            <svg 
              className="hi-heart-shape" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </button>

        <div className="hi-bottom-text">
          <p className="hi-msg-1">Something special<br/>is waiting...</p>
          <p className="hi-msg-2">Tap the heart ❤️</p>
        </div>
      </div>
    </div>
  );
}