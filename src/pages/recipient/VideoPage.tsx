import { useMemo, useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ChevronLeft, ChevronRight, Heart, Music, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { Surprise } from '../../lib/supabase';
import { type Theme, LightHearts } from '../../lib/effects';

interface Props {
  s: Surprise;
  theme: Theme;
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
}

export default function VideoPage({ s, theme, onNext, onPrev, isLast }: Props) {
  const accent = theme.accent;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [audioNotification, setAudioNotification] = useState<string | null>(null);

  // Extract YouTube ID if valid YouTube link
  const youtubeId = useMemo(() => {
    const raw = s.video_url ?? '';
    const m = raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }, [s.video_url]);

  // Determine the best direct video source
  const directVideoSrc = useMemo(() => {
    // 1. Prefer persistent cloud storage URL
    if (s.video_file_url && !s.video_file_url.startsWith('blob:')) {
      return s.video_file_url;
    }
    // 2. Direct external video URL (mp4, webm, etc.) if not a YouTube page
    if (s.video_url && !youtubeId) {
      return s.video_url;
    }
    // 3. Fallback to video_file_url (might be blob URL if testing in same session)
    return s.video_file_url || null;
  }, [s.video_file_url, s.video_url, youtubeId]);

  const isDeadBlob = Boolean(
    !youtubeId &&
    directVideoSrc &&
    directVideoSrc.startsWith('blob:') &&
    typeof window !== 'undefined'
  );

  const hasVideo = Boolean(youtubeId || directVideoSrc);

  // Sync initial mute state with video element
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      setMuted(v.muted);
    }
  }, [directVideoSrc]);

  // Safe Play/Pause toggle with mobile restriction handling
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;

    setPlaybackError(null);

    if (v.paused) {
      setIsBuffering(true);
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlaying(true);
            setIsBuffering(false);
          })
          .catch((err) => {
            console.warn('[VideoPage] Unmuted playback was prevented on mobile, trying muted fallback:', err);
            // Mobile browser policy often allows playback only when muted
            v.muted = true;
            setMuted(true);
            v.play()
              .then(() => {
                setPlaying(true);
                setIsBuffering(false);
                setAudioNotification('Playing muted. Tap sound icon for audio 🔊');
                setTimeout(() => setAudioNotification(null), 4000);
              })
              .catch((e2) => {
                console.error('[VideoPage] Muted play also failed:', e2);
                setIsBuffering(false);
                setPlaying(false);
                setPlaybackError('Playback blocked. Please tap play again.');
              });
          });
      }
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && audioNotification) {
      setAudioNotification(null);
    }
  };

  // Seek logic supporting both Mouse and Touch
  const handleSeekPosition = (clientX: number) => {
    const v = videoRef.current;
    const bar = progressBarRef.current;
    if (!v || !bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = clampedX / rect.width;
    v.currentTime = pct * duration;
    setProgress(v.currentTime);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSeekPosition(e.clientX);
  };

  const seekTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches.length > 0) {
      handleSeekPosition(e.touches[0].clientX);
    }
  };

  // Fullscreen support across Safari (iOS) and Chromium (Android/Desktop)
  const fullscreen = () => {
    const v = videoRef.current as any;
    if (!v) return;

    if (v.requestFullscreen) {
      v.requestFullscreen().catch(() => {});
    } else if (v.webkitEnterFullscreen) {
      // Native iOS Safari video fullscreen
      v.webkitEnterFullscreen();
    } else if (v.webkitRequestFullscreen) {
      v.webkitRequestFullscreen();
    }
  };

  const handleVideoError = () => {
    const v = videoRef.current;
    setIsBuffering(false);
    setPlaying(false);

    if (isDeadBlob) {
      setPlaybackError('This video was saved as a temporary browser preview and cannot be streamed on this device. Please edit the surprise to re-upload it.');
      return;
    }

    if (v && v.error) {
      switch (v.error.code) {
        case 1: // MEDIA_ERR_ABORTED
          setPlaybackError('Video loading was interrupted.');
          break;
        case 2: // MEDIA_ERR_NETWORK
          setPlaybackError('Network error while streaming video. Please check your connection.');
          break;
        case 3: // MEDIA_ERR_DECODE
          setPlaybackError('Video format or codec could not be decoded on this mobile device.');
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          setPlaybackError('This video format is not supported on this browser.');
          break;
        default:
          setPlaybackError('Unable to play video on this device.');
      }
    } else {
      setPlaybackError('Unable to load video. Please check your internet connection.');
    }
  };

  const retryPlayback = () => {
    const v = videoRef.current;
    if (!v) return;
    setPlaybackError(null);
    setIsBuffering(true);
    v.load();
    v.play()
      .then(() => {
        setPlaying(true);
        setIsBuffering(false);
      })
      .catch(() => {
        setIsBuffering(false);
      });
  };

  if (!hasVideo) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 50% 40%, ${accent}14, transparent 60%), ${theme.bg}`, color: '#fff', fontFamily: "'Inter', sans-serif", textAlign: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
        <LightHearts accent={accent} count={6} />
        <Music size={48} color={accent} />
        <h2 style={{ marginTop: 16, fontFamily: "'Dancing Script', cursive", fontSize: '2rem' }}>No video uploaded</h2>
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          <button onClick={onPrev} style={navBtnStyle}>Previous</button>
          <button onClick={onNext} className="btn-surprise" style={{ ...navBtnStyle, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none' }}>{isLast ? 'Finish' : 'Next'}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at 50% 40%, ${accent}14, transparent 60%), ${theme.bg}`, fontFamily: "'Inter', sans-serif", padding: '36px 16px 120px', position: 'relative', overflow: 'hidden' }}>
      <LightHearts accent={accent} count={6} />
      <div className="animate-page-in" style={{ maxWidth: 820, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Play size={24} color={accent} fill={accent} />
          <h2 style={{ margin: '8px 0 4px', fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(2rem, 5vw, 2.5rem)', color: '#fff' }}>
            A Special Video
          </h2>
          {s.video_title && <p style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 600 }}>{s.video_title}</p>}
          {s.video_dedication && (
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Heart size={13} color={accent} fill={accent} /> {s.video_dedication}
            </p>
          )}
        </div>

        {/* Player Container */}
        <div
          style={{
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            border: `1px solid ${accent}44`,
            boxShadow: `0 0 50px ${accent}33`,
            background: '#000',
            width: '100%',
            maxWidth: '100%',
            aspectRatio: '16 / 9',
            maxHeight: 'min(65vh, 460px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {youtubeId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&playsinline=1`}
              title="Special video"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={directVideoSrc ?? undefined}
                playsInline
                webkit-playsinline="true"
                preload="metadata"
                onTimeUpdate={(e) => setProgress((e.target as HTMLVideoElement).currentTime)}
                onLoadedMetadata={(e) => {
                  const v = e.target as HTMLVideoElement;
                  setDuration(v.duration);
                  setIsBuffering(false);
                }}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => {
                  setIsBuffering(false);
                  setPlaying(true);
                  setPlaybackError(null);
                }}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                onError={handleVideoError}
                onClick={togglePlay}
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: 'min(65vh, 460px)',
                  objectFit: 'contain',
                  display: 'block',
                  cursor: 'pointer',
                  background: '#000',
                }}
              />

              {/* Notification Banner (e.g. muted fallback) */}
              {audioNotification && (
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.85)',
                    border: `1px solid ${accent}88`,
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    zIndex: 6,
                    pointerEvents: 'none',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {audioNotification}
                </div>
              )}

              {/* Playback Error Message Overlay */}
              {playbackError && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    textAlign: 'center',
                    zIndex: 5,
                  }}
                >
                  <AlertCircle size={36} color="#ff4d85" style={{ marginBottom: 12 }} />
                  <p style={{ color: '#fff', fontSize: 14, maxWidth: 380, margin: '0 0 16px', lineHeight: 1.5 }}>
                    {playbackError}
                  </p>
                  {!isDeadBlob && (
                    <button
                      onClick={retryPlayback}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 20,
                        background: accent,
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <RefreshCw size={14} /> Try Again
                    </button>
                  )}
                </div>
              )}

              {/* Buffering Spinner */}
              {isBuffering && !playbackError && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 4,
                  }}
                >
                  <Loader2 size={44} className="animate-spin" color={accent} />
                </div>
              )}

              {/* Large Tap-to-Play Center Overlay when paused */}
              {!playing && !isBuffering && !playbackError && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play video"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 76,
                    height: 76,
                    borderRadius: '50%',
                    background: `${accent}e6`,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 35px ${accent}aa`,
                    transition: 'transform 0.2s ease',
                    zIndex: 3,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <Play size={36} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                </button>
              )}

              {/* Bottom Control Bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '10px 14px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  zIndex: 4,
                }}
              >
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={playing ? 'Pause' : 'Play'}
                  style={ctrlBtn}
                >
                  {playing ? <Pause size={20} /> : <Play size={20} fill="#fff" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  style={ctrlBtn}
                >
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                {/* Scrubber Progress Bar */}
                <div
                  ref={progressBarRef}
                  onClick={seek}
                  onTouchStart={seekTouch}
                  onTouchMove={seekTouch}
                  style={{
                    flex: 1,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.25)', position: 'relative' }}>
                    <div
                      style={{
                        width: `${duration ? (progress / duration) * 100 : 0}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: accent,
                        transition: 'width 0.1s linear',
                      }}
                    />
                  </div>
                </div>

                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, minWidth: 64, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(progress)} / {fmt(duration)}
                </span>

                <button
                  type="button"
                  onClick={fullscreen}
                  aria-label="Fullscreen"
                  style={ctrlBtn}
                >
                  <Maximize size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36, position: 'relative', zIndex: 2 }}>
        <button onClick={onPrev} style={navBtnStyle}>
          <ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Previous
        </button>
        <button
          onClick={onNext}
          className="btn-surprise"
          style={{ ...navBtnStyle, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none' }}
        >
          {isLast ? 'Finish' : 'Next'} <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
        </button>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  padding: '12px 28px',
  borderRadius: 9999,
  color: '#fff',
  fontWeight: 700,
  fontSize: 14,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  minHeight: 44,
  WebkitTapHighlightColor: 'transparent',
};

const ctrlBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  padding: 6,
  minWidth: 40,
  minHeight: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  WebkitTapHighlightColor: 'transparent',
};

function fmt(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}
