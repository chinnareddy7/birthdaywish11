import { useMemo, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ChevronLeft, ChevronRight, Heart, Music } from 'lucide-react';
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
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const youtubeId = useMemo(() => {
    const m = (s.video_url ?? '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }, [s.video_url]);

  const hasVideo = !!(s.video_url || s.video_file_url);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * duration;
  };

  const fullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
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
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at 50% 40%, ${accent}14, transparent 60%), ${theme.bg}`, fontFamily: "'Inter', sans-serif", padding: '48px 24px 120px', position: 'relative', overflow: 'hidden' }}>
      <LightHearts accent={accent} count={6} />
      <div className="animate-page-in" style={{ maxWidth: 820, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Play size={24} color={accent} fill={accent} />
          <h2 style={{ margin: '10px 0 4px', fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', color: '#fff' }}>A Special Video</h2>
          {s.video_title && <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 600 }}>{s.video_title}</p>}
          {s.video_dedication && <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Heart size={13} color={accent} fill={accent} /> {s.video_dedication}</p>}
        </div>

        {/* Player */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: `1px solid ${accent}44`, boxShadow: `0 0 50px ${accent}33`, background: '#000' }}>
          {youtubeId ? (
            <iframe width="100%" height="440" src={`https://www.youtube.com/embed/${youtubeId}?rel=0`} title="Special video" frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ display: 'block' }} />
          ) : (
            <>
              <video
                ref={videoRef}
                src={s.video_file_url ?? undefined}
                onTimeUpdate={(e) => setProgress((e.target as HTMLVideoElement).currentTime)}
                onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                onEnded={() => setPlaying(false)}
                onClick={togglePlay}
                style={{ width: '100%', maxHeight: 440, display: 'block', cursor: 'pointer' }}
              />
              {/* Custom controls overlay */}
              {!playing && (
                <button onClick={togglePlay} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 88, height: 88, borderRadius: '50%', background: `${accent}dd`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${accent}aa` }}>
                  <Play size={40} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                </button>
              )}
              {/* Control bar */}
              <div style={{ padding: '12px 16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={togglePlay} style={ctrlBtn}>{playing ? <Pause size={20} /> : <Play size={20} fill="#fff" />}</button>
                <button onClick={toggleMute} style={ctrlBtn}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
                <div onClick={seek} style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.2)', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ width: `${duration ? (progress / duration) * 100 : 0}%`, height: '100%', borderRadius: 3, background: accent, transition: 'width 0.1s' }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, minWidth: 70, textAlign: 'right' }}>{fmt(progress)} / {fmt(duration)}</span>
                <button onClick={fullscreen} style={ctrlBtn}><Maximize size={18} /></button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40, position: 'relative', zIndex: 2 }}>
        <button onClick={onPrev} style={navBtnStyle}><ChevronLeft size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Previous</button>
        <button onClick={onNext} className="btn-surprise" style={{ ...navBtnStyle, background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none' }}>{isLast ? 'Finish' : 'Next'} <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></button>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  padding: '12px 28px', borderRadius: 9999, color: '#fff', fontWeight: 700, fontSize: 14,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
};
const ctrlBtn: React.CSSProperties = {
  background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 4,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

function fmt(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}
