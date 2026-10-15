import { useEffect, useState } from 'react';
import type { Surprise } from '../../lib/supabase';
import type { Theme } from '../../lib/effects';
import { Heart, ChevronRight, X } from 'lucide-react';
import './AnimatedBirthdayGiftPage.css';

interface Props {
  s: Surprise;
  theme: Theme;
  onNext?: () => void;
  hasNextPage?: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '06 March 2002';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr || '06 March 2002';
  }
}

// Cute Cartoon Birthday Bear SVG component
function CuteBirthdayBear() {
  return (
    <svg className="cute-bear-svg" viewBox="0 0 400 400" width="100%" height="100%">
      {/* Confetti particles */}
      <rect x="55" y="75" width="8" height="15" rx="3" fill="#a29bfe" transform="rotate(25 55 75)" />
      <rect x="330" y="85" width="8" height="15" rx="3" fill="#00cec9" transform="rotate(-30 330 85)" />
      <rect x="75" y="215" width="9" height="14" rx="3" fill="#6c5ce7" transform="rotate(45 75 215)" />
      <rect x="335" y="175" width="8" height="14" rx="3" fill="#fd79a8" transform="rotate(15 335 175)" />
      <rect x="175" y="35" width="7" height="13" rx="2" fill="#e17055" transform="rotate(20 175 35)" />
      <rect x="290" y="50" width="8" height="13" rx="2" fill="#fdcb6e" transform="rotate(-15 290 50)" />
      <circle cx="95" cy="135" r="4" fill="#fdcb6e" />
      <circle cx="310" cy="135" r="4.5" fill="#e84393" />
      <circle cx="70" cy="280" r="3.5" fill="#00cec9" />
      <circle cx="330" cy="270" r="4" fill="#a29bfe" />

      {/* Bear Back Arm (holding cake) */}
      <g>
        <path
          d="M245 205 Q285 195 298 230 Q278 250 248 235 Z"
          fill="#a46845"
          stroke="#222"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {/* Birthday Cake */}
        <g id="birthday-cake-group">
          {/* Plate */}
          <ellipse cx="298" cy="208" rx="36" ry="9" fill="#333" stroke="#222" strokeWidth="3" />
          {/* Cake Base */}
          <path
            d="M268 184 L268 204 Q298 216 328 204 L328 184 Z"
            fill="#e27c62"
            stroke="#222"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Pink Frosting with drips */}
          <path
            d="M268 184 Q278 196 288 187 Q298 198 308 186 Q318 197 328 184 Q328 174 298 174 Q268 174 268 184 Z"
            fill="#ff78a5"
            stroke="#222"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* 3 Candles */}
          {/* Left Candle */}
          <rect x="280" y="160" width="5" height="17" fill="#48dbfb" stroke="#222" strokeWidth="1.8" rx="1" />
          <path d="M282.5 154 Q285.5 150 282.5 144 Q279.5 150 282.5 154 Z" fill="#ffd166" />
          <circle cx="282.5" cy="151" r="1.5" fill="#ff6b6b" />

          {/* Middle Candle */}
          <rect x="295.5" y="156" width="5" height="21" fill="#a29bfe" stroke="#222" strokeWidth="1.8" rx="1" />
          <path d="M298 150 Q301 146 298 140 Q295 146 298 150 Z" fill="#ffd166" />
          <circle cx="298" cy="147" r="1.5" fill="#ff6b6b" />

          {/* Right Candle */}
          <rect x="311" y="160" width="5" height="17" fill="#1dd1a1" stroke="#222" strokeWidth="1.8" rx="1" />
          <path d="M313.5 154 Q316.5 150 313.5 144 Q310.5 150 313.5 154 Z" fill="#ffd166" />
          <circle cx="313.5" cy="151" r="1.5" fill="#ff6b6b" />
        </g>
      </g>

      {/* Bear Tail */}
      <circle cx="288" cy="275" r="13" fill="#a46845" stroke="#222" strokeWidth="4" />

      {/* Bear Body */}
      <path
        d="M175 195 C145 235, 140 285, 185 330 C235 350, 275 325, 282 265 C286 220, 258 190, 235 192 Z"
        fill="#a46845"
        stroke="#222"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Bear Feet */}
      {/* Left foot */}
      <ellipse cx="195" cy="330" rx="20" ry="14" fill="#a46845" stroke="#222" strokeWidth="4" transform="rotate(18 195 330)" />
      {/* Right foot */}
      <ellipse cx="265" cy="310" rx="18" ry="14" fill="#a46845" stroke="#222" strokeWidth="4" transform="rotate(-22 265 310)" />

      {/* Belly patch */}
      <ellipse cx="225" cy="268" rx="35" ry="42" fill="#ffd8b8" />

      {/* Bear Ears */}
      {/* Left ear */}
      <circle cx="178" cy="138" r="22" fill="#a46845" stroke="#222" strokeWidth="4" />
      <circle cx="178" cy="138" r="12" fill="#e0a37e" />
      {/* Right ear */}
      <circle cx="270" cy="144" r="22" fill="#a46845" stroke="#222" strokeWidth="4" />
      <circle cx="270" cy="144" r="12" fill="#e0a37e" />

      {/* Bear Head */}
      <ellipse cx="224" cy="176" rx="56" ry="50" fill="#a46845" stroke="#222" strokeWidth="4.5" transform="rotate(-6 224 176)" />

      {/* Party Hat on Head */}
      <g>
        <polygon points="232,84 204,146 256,140" fill="#81ecec" stroke="#222" strokeWidth="4" strokeLinejoin="round" />
        <polygon points="232,84 218,118 244,114" fill="#a29bfe" />
        <line x1="206" y1="138" x2="252" y2="132" stroke="#222" strokeWidth="2.5" />
        <circle cx="232" cy="82" r="8" fill="#ffd166" stroke="#222" strokeWidth="3" />
      </g>

      {/* Bear Face */}
      {/* Snout */}
      <ellipse cx="218" cy="188" rx="24" ry="18" fill="#ffd8b8" />
      <ellipse cx="216" cy="180" rx="6" ry="4" fill="#222" />
      {/* Mouth */}
      <path d="M212 186 Q216 193 220 186" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" />
      <path d="M213 187 Q217 198 221 187 Z" fill="#ff7675" stroke="#222" strokeWidth="1.8" />
      {/* Blushing cheeks */}
      <ellipse cx="188" cy="188" rx="10" ry="6" fill="#ff7890" opacity="0.85" />
      <ellipse cx="248" cy="184" rx="10" ry="6" fill="#ff7890" opacity="0.85" />
      {/* Eyes */}
      <circle cx="198" cy="168" r="7" fill="#222" />
      <circle cx="200" cy="166" r="2.5" fill="#fff" />
      <circle cx="238" cy="164" r="7" fill="#222" />
      <circle cx="240" cy="162" r="2.5" fill="#fff" />

      {/* Bear Front Arm (waving happily to the left) */}
      <path
        d="M185 208 Q138 186 132 222 Q148 248 184 238 Z"
        fill="#a46845"
        stroke="#222"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AnimatedBirthdayGiftPage({ s, onNext, hasNextPage }: Props) {
  const [showLetter, setShowLetter] = useState(false);
  const [typedDate, setTypedDate] = useState('');
  const [dateDone, setDateDone] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const [typedLetter, setTypedLetter] = useState('');

  const targetDate = formatDate(s.birthday_date);
  const recipientName = s.nickname || s.recipient_name || 'Cutie';
  const letterText =
    s.letter ||
    `You are a very special person. Today, I wish you all the best, lots of health, and lots of joy. I always hope we will celebrate many more birthdays like this together. Happy birthday to you! 💕`;
  const letterTitle = `To ${recipientName}`;

  // Check if custom verification / user photo is provided and valid
  const hasCustomPhoto = Boolean(
    s.verification_photo_url && !s.verification_photo_url.includes('11.png')
  ) || Boolean(
    s.letter_photo_url && !s.letter_photo_url.includes('11.png')
  );
  const customPhotoUrl = s.verification_photo_url || s.letter_photo_url || '';

  // ── Date Typewriter effect ───────────────────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const startDelay = setTimeout(() => {
      let idx = 0;
      timer = setInterval(() => {
        if (idx < targetDate.length) {
          setTypedDate(targetDate.slice(0, idx + 1));
          idx++;
        } else {
          setDateDone(true);
          clearInterval(timer);
        }
      }, 70);
    }, 1200);

    return () => {
      clearTimeout(startDelay);
      clearInterval(timer);
    };
  }, [targetDate]);

  // ── Letter Typewriter effect ─────────────────────────────────────────────
  useEffect(() => {
    if (!showLetter) {
      setTypedTitle('');
      setTypedLetter('');
      return;
    }

    let titleTimer: NodeJS.Timeout;
    let letterTimer: NodeJS.Timeout;

    // Type title first
    const titleDelay = setTimeout(() => {
      let tIdx = 0;
      titleTimer = setInterval(() => {
        if (tIdx < letterTitle.length) {
          setTypedTitle(letterTitle.slice(0, tIdx + 1));
          tIdx++;
        } else {
          clearInterval(titleTimer);
          // Start typing letter content
          let lIdx = 0;
          letterTimer = setInterval(() => {
            if (lIdx < letterText.length) {
              setTypedLetter(letterText.slice(0, lIdx + 1));
              lIdx++;
            } else {
              clearInterval(letterTimer);
            }
          }, 30);
        }
      }, 70);
    }, 300);

    return () => {
      clearTimeout(titleDelay);
      clearInterval(titleTimer);
      clearInterval(letterTimer);
    };
  }, [showLetter, letterTitle, letterText]);

  // ── Floating Heart Cursor Particles ──────────────────────────────────────
  useEffect(() => {
    const colours = ['#ff3366', '#ff6699', '#ff33cc', '#ff99cc', '#ff66b2', '#ff0066'];
    const minisize = 14;
    const maxisize = 26;
    const heartCount = 30;
    const hearts: HTMLDivElement[] = [];
    const herzx: number[] = [];
    const herzy: (number | false)[] = [];
    const herzs: number[] = [];

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let oldX = mouseX;
    let oldY = mouseY;
    let animId: number;

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    for (let i = 0; i < heartCount; i++) {
      const heart = document.createElement('div');
      heart.style.position = 'absolute';
      heart.style.visibility = 'hidden';
      heart.style.color = colours[i % colours.length];
      heart.style.pointerEvents = 'none';
      heart.style.opacity = '0.75';
      heart.style.userSelect = 'none';
      heart.textContent = '♥';
      container.appendChild(heart);
      hearts[i] = heart;
      herzy[i] = false;
      herzx[i] = 0;
      herzs[i] = minisize;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    function tick() {
      if (Math.abs(mouseX - oldX) > 1 || Math.abs(mouseY - oldY) > 1) {
        oldX = mouseX;
        oldY = mouseY;
        for (let c = 0; c < heartCount; c++) {
          if (herzy[c] === false) {
            herzx[c] = mouseX - minisize / 2;
            herzy[c] = mouseY - minisize;
            hearts[c].style.left = `${herzx[c]}px`;
            hearts[c].style.top = `${herzy[c]}px`;
            hearts[c].style.fontSize = `${minisize}px`;
            hearts[c].style.visibility = 'visible';
            herzs[c] = minisize;
            break;
          }
        }
      }

      for (let i = 0; i < heartCount; i++) {
        if (herzy[i] !== false) {
          herzy[i] = (herzy[i] as number) - (herzs[i] / minisize + (i % 2));
          herzx[i] += (i % 5 - 2) / 5;

          if ((herzy[i] as number) < -herzs[i] || herzx[i] < -herzs[i] || herzx[i] > window.innerWidth) {
            hearts[i].style.visibility = 'hidden';
            herzy[i] = false;
          } else {
            if (Math.random() < maxisize / Math.max(1, herzy[i] as number) && herzs[i] < maxisize) {
              herzs[i] += 1;
              hearts[i].style.fontSize = `${herzs[i]}px`;
            }
            hearts[i].style.top = `${herzy[i]}px`;
            hearts[i].style.left = `${herzx[i]}px`;
          }
        }
      }

      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  return (
    <div className="birthday-gift-root">
      <div className="birthday-gift-wrapper">
        {/* Top Flags Bunting Banners */}
        <div className="flag__birthday">
          <svg className="flag__left" width="340" height="95" viewBox="0 0 340 95" fill="none">
            <path d="M5 15 Q 170 65 335 12" stroke="#222" strokeWidth="2.5" fill="none" strokeDasharray="5 4" />
            <polygon points="25,25 55,75 70,30" fill="#ff7882" stroke="#222" strokeWidth="2.5" />
            <polygon points="85,32 115,84 130,36" fill="#ffd166" stroke="#222" strokeWidth="2.5" />
            <polygon points="145,38 175,88 190,40" fill="#06d6a0" stroke="#222" strokeWidth="2.5" />
            <polygon points="205,36 235,84 250,34" fill="#118ab2" stroke="#222" strokeWidth="2.5" />
            <polygon points="265,28 292,72 302,22" fill="#a06cd5" stroke="#222" strokeWidth="2.5" />
          </svg>
          <svg className="flag__right" width="340" height="95" viewBox="0 0 340 95" fill="none">
            <path d="M5 15 Q 170 65 335 12" stroke="#222" strokeWidth="2.5" fill="none" strokeDasharray="5 4" />
            <polygon points="25,25 55,75 70,30" fill="#ff7882" stroke="#222" strokeWidth="2.5" />
            <polygon points="85,32 115,84 130,36" fill="#ffd166" stroke="#222" strokeWidth="2.5" />
            <polygon points="145,38 175,88 190,40" fill="#06d6a0" stroke="#222" strokeWidth="2.5" />
            <polygon points="205,36 235,84 250,34" fill="#118ab2" stroke="#222" strokeWidth="2.5" />
            <polygon points="265,28 292,72 302,22" fill="#a06cd5" stroke="#222" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Main Content Area */}
        <div className="birthday-gift-content">
          {/* Left Column: Happy Birthday, Party Hat, Date Badge, and Click Here */}
          <div className="left">
            <div className="birthday-gift-title">
              <h1 className="happy">
                <span style={{ animationDelay: '0.2s' }}>H</span>
                <span style={{ animationDelay: '0.3s' }}>a</span>
                <span style={{ animationDelay: '0.4s' }}>p</span>
                <span style={{ animationDelay: '0.5s' }}>p</span>
                <span style={{ animationDelay: '0.6s' }}>y</span>
              </h1>
              <h1 className="birthday">
                <span style={{ animationDelay: '0.7s' }}>B</span>
                <span style={{ animationDelay: '0.8s' }}>i</span>
                <span style={{ animationDelay: '0.9s' }}>r</span>
                <span style={{ animationDelay: '1.0s' }}>t</span>
                <span style={{ animationDelay: '1.1s' }}>h</span>
                <span style={{ animationDelay: '1.2s' }}>d</span>
                <span style={{ animationDelay: '1.3s' }}>a</span>
                <span style={{ animationDelay: '1.4s' }}>y</span>
              </h1>

              {/* Party Hat on top of "py" of Happy */}
              <div className="hat">
                <svg width="100" height="120" viewBox="0 0 100 120">
                  <polygon points="50,15 15,100 85,100" fill="#ff7882" stroke="#222" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="50,15 35,100 50,100" fill="#ffd166" />
                  <polygon points="50,15 65,100 85,100" fill="#06d6a0" />
                  <circle cx="50" cy="12" r="10" fill="#ffeb3b" stroke="#222" strokeWidth="3.5" />
                  <circle cx="35" cy="55" r="4" fill="#fff" />
                  <circle cx="65" cy="65" r="5" fill="#fff" />
                  <circle cx="50" cy="80" r="4" fill="#fff" />
                </svg>
              </div>
            </div>

            {/* Date of Birth Badge with Solid Black Stars */}
            <div className="date__of__birth">
              <span className="star-icon">★</span>
              <span className="date-text">{typedDate || targetDate}</span>
              <span className="star-icon">★</span>
            </div>

            {/* "Click here ✉" Button */}
            <div className="btn">
              <button id="btn__letter" onClick={() => setShowLetter(true)}>
                <span>Click here</span>
                <span className="letter-btn-icon">✉</span>
              </button>
            </div>
          </div>

          {/* Center Smiley Face Badge */}
          <div className="smiley__icon">
            <svg width="58" height="58" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" fill="#ffffff" stroke="#222222" strokeWidth="3.8" />
              <ellipse cx="21" cy="24" rx="3.5" ry="5.5" fill="#222222" />
              <ellipse cx="39" cy="24" rx="3.5" ry="5.5" fill="#222222" />
              <path
                d="M18 33 Q 30 48 42 33"
                stroke="#222222"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Right Column: Cartoon Bear Circle (or Custom Photo), Name Badge & Balloons */}
          <div className="right">
            <div className="box__account">
              {/* Balloon Top Left of Circle */}
              <div className="balloon_one">
                <svg width="90" height="130" viewBox="0 0 100 140">
                  <path
                    d="M50 10 C15 10, 10 55, 10 75 C10 105, 45 115, 50 118 C55 115, 90 105, 90 75 C90 55, 85 10, 50 10 Z"
                    fill="#ff8590"
                    stroke="#222"
                    strokeWidth="3.5"
                  />
                  <ellipse cx="33" cy="35" rx="7" ry="16" transform="rotate(-30 33 35)" fill="rgba(255,255,255,0.6)" />
                  <polygon points="46,118 54,118 50,123" fill="#ff8590" stroke="#222" strokeWidth="2.5" />
                  <path d="M50 123 Q 62 138 46 154 Q 58 168 50 180" stroke="#222" strokeWidth="2.5" fill="none" />
                </svg>
              </div>

              {/* Main Circle: Cute Birthday Bear (or photo fallback) */}
              <div className="image">
                {hasCustomPhoto ? (
                  <img
                    src={customPhotoUrl}
                    alt={recipientName}
                    onError={(e) => {
                      // Fallback to Bear illustration if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <CuteBirthdayBear />
                )}
              </div>

              {/* Name Tag below Circle: ❤️ Cutie ❤️ */}
              <div className="birthday-gift-name">
                <span className="heart-icon">❤️</span>
                <span className="name-text">{recipientName}</span>
                <span className="heart-icon">❤️</span>
              </div>

              {/* Balloon Bottom Right of Circle */}
              <div className="balloon_two">
                <svg width="90" height="130" viewBox="0 0 100 140">
                  <path
                    d="M50 10 C15 10, 10 55, 10 75 C10 105, 45 115, 50 118 C55 115, 90 105, 90 75 C90 55, 85 10, 50 10 Z"
                    fill="#ff8590"
                    stroke="#222"
                    strokeWidth="3.5"
                  />
                  <ellipse cx="33" cy="35" rx="7" ry="16" transform="rotate(-30 33 35)" fill="rgba(255,255,255,0.6)" />
                  <polygon points="46,118 54,118 50,123" fill="#ff8590" stroke="#222" strokeWidth="2.5" />
                  <path d="M50 123 Q 38 138 54 154 Q 42 168 50 180" stroke="#222" strokeWidth="2.5" fill="none" />
                </svg>
              </div>
            </div>

            {/* Top-Right Rotating Circular Stamp Badge */}
            <div className="cricle">
              <div className="stamp-badge">
                <svg viewBox="0 0 100 100" className="stamp-svg">
                  <path
                    id="circlePath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="stamp-text">
                    <textPath href="#circlePath" startOffset="0%">
                      HAPPY • BIRTHDAY • HAPPY • BIRTHDAY •
                    </textPath>
                  </text>
                </svg>
                <div className="stamp-center-heart">❤️</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scattered 4-Point Black Sparkle Stars */}
        <div className="sparkle-star star-top-left">✦</div>
        <div className="sparkle-star star-mid-left">✦</div>
        <div className="sparkle-star star-bottom-left">✦</div>
        <div className="sparkle-star star-center">✦</div>
        <div className="sparkle-star star-top-right">✦</div>

        {/* Floating Mini Hearts */}
        <div className="floating-mini-heart heart-pos-1">♥</div>
        <div className="floating-mini-heart heart-pos-2">♥</div>
        <div className="floating-mini-heart heart-pos-3">♥</div>
        <div className="floating-mini-heart heart-pos-4">♥</div>
        <div className="floating-mini-heart heart-pos-5">♥</div>
        <div className="floating-mini-heart heart-pos-6">♥</div>

        {/* Bottom Right Organic Wavy Blob Shape */}
        <div className="corner-blob">
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <path
              d="M 40,200 Q 30,120 90,80 Q 150,40 200,90 L 200,200 Z"
              fill="#ff7885"
            />
          </svg>
        </div>

        {/* Letter Popup Modal */}
        {showLetter && (
          <div className="box__letter" onClick={() => setShowLetter(false)}>
            <div className="letter__border" onClick={(e) => e.stopPropagation()}>
              <div className="close" onClick={() => setShowLetter(false)}>
                <X size={20} />
              </div>

              <div className="letter">
                <div className="title__letter">
                  {typedTitle}
                  {typedTitle && <span style={{ color: '#F61F1F', marginLeft: 8 }}>❤️</span>}
                </div>

                <div className="content__letter">
                  {/* Left part of letter */}
                  <div className="left">
                    <img
                      id="heart__letter"
                      src="https://media0.giphy.com/media/c76IJLufpNwSULPk77/giphy.gif"
                      alt="Heart Animation"
                    />
                    <div className="heart heart_1 animation" style={{ ['--t' as string]: '0.2s' }}>
                      <Heart size={20} fill="#ff3366" color="#ff3366" />
                    </div>
                    <div className="heart heart_2 animation" style={{ ['--t' as string]: '0.4s' }}>
                      <Heart size={22} fill="#ff6699" color="#ff6699" />
                    </div>
                    <div className="heart heart_3 animation" style={{ ['--t' as string]: '0.6s' }}>
                      <Heart size={24} fill="#ff33cc" color="#ff33cc" />
                    </div>
                    <div className="heart heart_4 animation" style={{ ['--t' as string]: '0.8s' }}>
                      <Heart size={18} fill="#ff0066" color="#ff0066" />
                    </div>
                  </div>

                  {/* Right part of letter */}
                  <div className="right">
                    <div className="love__img">
                      <img
                        src="https://media4.giphy.com/media/W4jyjmIpnw6e38B6Qc/giphy.gif"
                        alt="Love Animation"
                      />
                    </div>
                    <div className="text__letter">
                      <p>{typedLetter}</p>
                    </div>
                    <img
                      id="mewmew"
                      src="https://media1.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif"
                      alt="Cat Mew"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions if next pages exist */}
        {hasNextPage && onNext && (
          <div className="birthday-gift-bottom-nav">
            <button className="birthday-gift-bottom-btn" onClick={onNext}>
              <span>Explore Photo Memories & Video</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

