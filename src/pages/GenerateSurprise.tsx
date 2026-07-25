import { useState, useRef, useEffect } from 'react';
import {
  Home, Gift, LayoutGrid, HelpCircle, Star, Music, Moon,
  User, Heart, Calendar, Palette, ChevronDown, Lock, Sparkles,
  FileText, Image, Video, Wand2, ArrowLeft, Upload, X, Play, Check, PartyPopper,
  Copy, Eye, Trash2, Edit3, Share2, MessageCircle, Send, Mail, Phone, QrCode, Loader2,
} from 'lucide-react';
import { supabase, hashPassword, generateSlug, type Memory as SupabaseMemory } from '../lib/supabase';

interface Props {
  onBack: () => void;
}

const SIDEBAR_ITEMS = [
  { icon: <Home size={22} />, label: 'Home', back: true },
  { icon: <Gift size={22} />, label: 'My Surprises', back: false },
  { icon: <LayoutGrid size={22} />, label: 'Templates', back: false },
  { icon: <HelpCircle size={22} />, label: 'How It Works', back: false },
];

const STEPS = [
  { num: 1, label: 'Personal Information' },
  { num: 2, label: 'Birthday Letter' },
  { num: 3, label: 'Beautiful Memories' },
  { num: 4, label: 'Special Video' },
];

const THEMES = [
  { id: 'pink', label: 'Pink Dream', gradient: 'linear-gradient(135deg, #ff6eb0 0%, #c026d3 50%, #7c3aed 100%)' },
  { id: 'purple', label: 'Purple Night', gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #2e1065 100%)' },
  { id: 'blue', label: 'Ocean Blue', gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)' },
  { id: 'gold', label: 'Royal Gold', gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #f59e0b 100%)' },
  { id: 'neon', label: 'Neon Party', gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)' },
];

const PREVIEW_FEATURES = [
  { icon: <FileText size={18} style={{ color: '#FF4DA6' }} />, label: 'Heartfelt\nLetter', color: '#FF4DA6' },
  { icon: <Image size={18} style={{ color: '#A78BFA' }} />, label: 'Beautiful\nMemories', color: '#A78BFA' },
  { icon: <Video size={18} style={{ color: '#FF4DA6' }} />, label: 'Special\nVideo', color: '#FF4DA6' },
  { icon: <Sparkles size={18} style={{ color: '#A78BFA' }} />, label: 'Magical\nEffects', color: '#A78BFA' },
];

const LETTER_TEMPLATES = [
  { id: 'romantic', label: 'Romantic', text: "My love,\n\nOn your birthday, I want you to know that every moment with you has been the best gift of my life. You make my world brighter just by being in it.\n\nHappy Birthday, my forever person.\n\nForever yours,\nMe" },
  { id: 'funny', label: 'Funny', text: "Hey birthday human!\n\nCongratulations on surviving another year of my jokes. You deserve a medal (and a cake). May your day be sweeter than the frosting and way less calories.\n\nHappy Birthday!\nYour partner in crime" },
  { id: 'sentimental', label: 'Sentimental', text: "To someone who means the world to me,\n\nEvery birthday with you feels like a small miracle. Thank you for your laughter, your patience, and all the quiet moments we've shared. Here's to many more.\n\nWith all my heart,\nMe" },
  { id: 'short', label: 'Short & Sweet', text: "Happy Birthday!\n\nYou are loved more than words can say. Today, tomorrow, and always.\n\nXOXO" },
];

const PREVIEW_IMG: Record<number, string> = {
  1: '/11.png',
  2: '/22.png',
  3: '/33.png',
  4: '/44.png',
};

const PREVIEW_TITLE: Record<number, string> = {
  1: 'Personal Info Preview',
  2: 'Letter Preview',
  3: 'Memories Preview',
  4: 'Video Preview',
};

interface Memory {
  id: string;
  url: string;
  caption: string;
}

// Ensure local Memory is structurally compatible with the Supabase Memory.
type _Compat = SupabaseMemory extends Memory ? true : false;

function ThemeCard({ theme, selected, onClick }: { theme: typeof THEMES[0]; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        border: selected ? '2px solid #FF1F8C' : '2px solid transparent',
        boxShadow: selected ? '0 0 16px rgba(255,31,140,0.5)' : 'none',
        transition: 'all 0.2s',
        position: 'relative',
        flexShrink: 0,
        width: 90,
      }}
    >
      <div style={{ width: 90, height: 72, background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ width: 18, height: 22, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', background: 'rgba(255,255,255,0.35)', position: 'absolute', left: 10, top: 8 }} />
        <div style={{ width: 14, height: 18, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', background: 'rgba(255,255,255,0.25)', position: 'absolute', left: 22, top: 16 }} />
        <div style={{ width: 16, height: 20, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', background: 'rgba(255,255,255,0.3)', position: 'absolute', right: 8, top: 6 }} />
        <div style={{ width: 28, height: 22, borderRadius: 4, background: 'rgba(255,255,255,0.3)', position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)' }} />
      </div>
      {selected && (
        <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: '#FF1F8C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={10} height={10} viewBox="0 0 12 12"><path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
        </div>
      )}
      <div style={{ padding: '6px 4px', background: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
        <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{theme.label}</span>
      </div>
    </div>
  );
}

function InputField({ icon, placeholder, type = 'text', value, onChange }: { icon: React.ReactNode; placeholder: string; type?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}>{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: '100%', padding: '12px 16px 12px 44px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 10, color: '#fff', fontSize: 14,
          outline: 'none', transition: 'border 0.2s',
          fontFamily: "'Inter', sans-serif",
        }}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(255,31,140,0.5)'; e.target.style.background = 'rgba(255,31,140,0.05)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.25)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
      />
    </div>
  );
}

function SelectField({ icon, placeholder, value, onChange, options }: { icon: React.ReactNode; placeholder: string; value?: string; onChange?: (v: string) => void; options?: { value: string; label: string }[] }) {
  const opts = options ?? [
    { value: 'partner', label: 'Partner' },
    { value: 'friend', label: 'Friend' },
    { value: 'family', label: 'Family Member' },
    { value: 'other', label: 'Other' },
  ];
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}>{icon}</div>
      <select
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: '100%', padding: '12px 44px 12px 44px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 10, color: value ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 14,
          outline: 'none', appearance: 'none', cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <option value="" style={{ background: '#1a0f2e' }}>{placeholder}</option>
        {opts.map((o) => (
          <option key={o.value} value={o.value} style={{ background: '#1a0f2e' }}>{o.label}</option>
        ))}
      </select>
      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }}>
        <ChevronDown size={16} />
      </div>
    </div>
  );
}

// ── Step 1: Personal Information ─────────────────────────────────────────────
function Step1({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(123,63,228,0.3), rgba(255,31,140,0.3))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={22} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#FF4DA6', fontWeight: 600, marginBottom: 2 }}>Step 1 of 4</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Personal Information</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Tell us about the birthday person to make it extra special. 💌</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Birthday Person's Name <span style={{ color: '#FF4DA6' }}>*</span></label>
          <InputField icon={<User size={16} />} placeholder="Enter their name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Nickname (Optional)</label>
          <InputField icon={<User size={16} />} placeholder="Enter a cute nickname" value={form.nickname} onChange={(v) => setForm({ ...form, nickname: v })} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Your Name <span style={{ color: '#FF4DA6' }}>*</span></label>
          <InputField icon={<User size={16} />} placeholder="Enter your name" value={form.yourName} onChange={(v) => setForm({ ...form, yourName: v })} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Relationship <span style={{ color: '#FF4DA6' }}>*</span></label>
          <SelectField icon={<Heart size={16} />} placeholder="Select your relationship" value={form.relationship} onChange={(v) => setForm({ ...form, relationship: v })} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Birthday Date <span style={{ color: '#FF4DA6' }}>*</span></label>
          <InputField icon={<Calendar size={16} />} placeholder="Select birthday date" type="date" value={form.birthdayDate} onChange={(v) => setForm({ ...form, birthdayDate: v })} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Choose Theme <span style={{ color: '#FF4DA6' }}>*</span></label>
          <SelectField icon={<Palette size={16} />} placeholder="Select a beautiful theme" value={form.theme} onChange={(v) => setForm({ ...form, theme: v })} options={THEMES.map((t) => ({ value: t.id, label: t.label }))} />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>Choose a Theme</label>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {THEMES.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} selected={form.theme === theme.id} onClick={() => setForm({ ...form, theme: theme.id })} />
          ))}
        </div>
      </div>
    </>
  );
}

// ── Step 2: Birthday Letter ───────────────────────────────────────────────────
function Step2({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(123,63,228,0.3), rgba(255,31,140,0.3))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={22} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#FF4DA6', fontWeight: 600, marginBottom: 2 }}>Step 2 of 4</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Birthday Letter</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Write a heartfelt letter from your heart. 💌</p>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>Choose a Template</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {LETTER_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setForm({ ...form, letter: tpl.text })}
              style={{
                padding: '8px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: form.letter === tpl.text ? 'rgba(255,31,140,0.15)' : 'rgba(255,255,255,0.04)',
                border: form.letter === tpl.text ? '1px solid rgba(255,31,140,0.5)' : '1px solid rgba(139,92,246,0.2)',
                color: form.letter === tpl.text ? '#FF4DA6' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.2s',
              }}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Your Message <span style={{ color: '#FF4DA6' }}>*</span></label>
        <textarea
          value={form.letter}
          onChange={(e) => setForm({ ...form, letter: e.target.value })}
          placeholder="Write your heartfelt message here..."
          rows={8}
          style={{
            width: '100%', padding: '14px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 10, color: '#fff', fontSize: 14,
            outline: 'none', resize: 'vertical', minHeight: 160,
            fontFamily: "'Inter', sans-serif", lineHeight: 1.6,
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(255,31,140,0.5)'; e.target.style.background = 'rgba(255,31,140,0.05)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(139,92,246,0.25)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{form.letter?.length ?? 0} characters</span>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Add a Photo to the Letter (Optional)</label>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setForm({ ...form, letterPhoto: URL.createObjectURL(f) });
        }} />
        {form.letterPhoto ? (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)' }}>
            <img src={form.letterPhoto} alt="Letter" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
            <button onClick={() => setForm({ ...form, letterPhoto: null })} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '24px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(139,92,246,0.3)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Upload size={24} style={{ color: '#A78BFA' }} />
            Click to upload a photo
          </button>
        )}
      </div>
    </>
  );
}

// ── Step 3: Beautiful Memories ─────────────────────────────────────────────────
function Step3({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const memories: Memory[] = form.memories ?? [];

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newMems: Memory[] = Array.from(files).slice(0, 8 - memories.length).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: URL.createObjectURL(f),
      caption: '',
    }));
    setForm({ ...form, memories: [...memories, ...newMems] });
  };

  const removeMemory = (id: string) => {
    setForm({ ...form, memories: memories.filter((m) => m.id !== id) });
  };

  const setCaption = (id: string, caption: string) => {
    setForm({ ...form, memories: memories.map((m) => (m.id === id ? { ...m, caption } : m)) });
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(123,63,228,0.3), rgba(255,31,140,0.3))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Image size={22} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#FF4DA6', fontWeight: 600, marginBottom: 2 }}>Step 3 of 4</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Beautiful Memories</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Upload up to 8 of your favorite photos together. 📸</p>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
        {memories.map((m) => (
          <div key={m.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(255,255,255,0.03)' }}>
            <img src={m.url} alt="Memory" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
            <button onClick={() => removeMemory(m.id)} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} />
            </button>
            <input
              value={m.caption}
              onChange={(e) => setCaption(m.id, e.target.value)}
              placeholder="Add caption..."
              style={{ width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(139,92,246,0.15)', color: '#fff', fontSize: 11, outline: 'none', fontFamily: "'Inter', sans-serif" }}
            />
          </div>
        ))}
        {memories.length < 8 && (
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              height: 134, borderRadius: 12, cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)',
              border: '2px dashed rgba(139,92,246,0.3)',
              color: 'rgba(255,255,255,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12,
            }}
          >
            <Upload size={22} style={{ color: '#A78BFA' }} />
            Add Photo
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{memories.length}/8</span>
          </button>
        )}
      </div>
      {memories.length === 0 && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 0 }}>
          No memories added yet. Click the box above to upload your first photo.
        </p>
      )}
    </>
  );
}

// ── Step 4: Special Video ──────────────────────────────────────────────────────
function Step4({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const youtubeId = (() => {
    const m = (form.videoUrl ?? '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  })();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(123,63,228,0.3), rgba(255,31,140,0.3))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Video size={22} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#FF4DA6', fontWeight: 600, marginBottom: 2 }}>Step 4 of 4</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Special Video</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Add a video message or a favorite clip. 🎬</p>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Video URL (YouTube)</label>
        <InputField icon={<Play size={16} />} placeholder="Paste a YouTube link" value={form.videoUrl} onChange={(v) => setForm({ ...form, videoUrl: v })} />
        {form.videoUrl && (
          <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.25)' }}>
            {youtubeId ? (
              <iframe
                width="100%"
                height="220"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="Video preview"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                Please paste a valid YouTube link.
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Or Upload a Video</label>
        <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setForm({ ...form, videoFile: URL.createObjectURL(f), videoFileName: f.name });
        }} />
        {form.videoFile ? (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)' }}>
            <video src={form.videoFile} controls style={{ width: '100%', maxHeight: 240, display: 'block' }} />
            <button onClick={() => setForm({ ...form, videoFile: null, videoFileName: null })} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '24px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(139,92,246,0.3)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Upload size={24} style={{ color: '#A78BFA' }} />
            Click to upload a video
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Video Title (Optional)</label>
          <InputField icon={<FileText size={16} />} placeholder="Give your video a title" value={form.videoTitle} onChange={(v) => setForm({ ...form, videoTitle: v })} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Dedication Message (Optional)</label>
          <InputField icon={<Heart size={16} />} placeholder="A short dedication" value={form.videoDedication} onChange={(v) => setForm({ ...form, videoDedication: v })} />
        </div>
      </div>

      <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.usePassword} onChange={(e) => setForm({ ...form, usePassword: e.target.checked, password: '' })} style={{ accentColor: '#FF1F8C' }} />
          <Lock size={14} style={{ color: '#FF4DA6' }} /> Protect this surprise with a password (optional)
        </label>
        {form.usePassword && (
          <div style={{ marginTop: 12 }}>
            <InputField icon={<Lock size={16} />} placeholder="Choose a password" type="text" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
            <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Anyone with the link will need this password to view the surprise.</p>
          </div>
        )}
      </div>
    </>
  );
}

// ── Share screen ───────────────────────────────────────────────────────────────
function ShareScreen({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const shareUrl = `${window.location.origin}/s/${slug}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'A Birthday Surprise', text: 'Open your birthday surprise!', url: shareUrl });
      } catch { /* user cancelled */ }
    } else {
      copy();
    }
  };

  const shareTo = (kind: 'whatsapp' | 'telegram' | 'email' | 'sms') => {
    const text = encodeURIComponent('Open your birthday surprise! ');
    const url = encodeURIComponent(shareUrl);
    const map: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      email: `mailto:?subject=A%20Birthday%20Surprise&body=${text}${url}`,
      sms: `sms:?&body=${text}${url}`,
    };
    window.open(map[kind], '_blank');
  };

  const downloadQR = () => {
    // Free QR code via public API; rendered as an image the user can save.
    const img = new (window as any).Image() as HTMLImageElement;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      try {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `surprise-${slug}-qr.png`;
        a.click();
      } catch {
        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    };
    img.onerror = () => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl)}`, '_blank');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl)}`;
  };

  const removeSurprise = async () => {
    if (!confirm('Delete this surprise? This cannot be undone.')) return;
    await supabase.from('surprises').delete().eq('slug', slug);
    setDeleted(true);
  };

  if (deleted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 28px', textAlign: 'center', flex: 1 }}>
        <Trash2 size={48} color="#FF4DA6" />
        <h2 style={{ margin: '16px 0 8px', color: '#fff', fontSize: 22 }}>Surprise deleted</h2>
        <button onClick={onBack} className="btn-surprise" style={{ marginTop: 16, padding: '12px 28px', borderRadius: 9999, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Home size={16} /> Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 28px', flex: 1, overflow: 'auto' }}>
      <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg, #FF1F8C, #C026D3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 0 40px rgba(255,31,140,0.5)' }}>
        <PartyPopper size={36} color="#fff" />
      </div>
      <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: '#fff', textAlign: 'center' }}>🎉 Your Birthday Surprise is Ready!</h2>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 420 }}>
        Congratulations! Your surprise has been created successfully.
      </p>

      <div style={{ width: '100%', maxWidth: 560, background: 'rgba(13,9,24,0.7)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 18, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Share2 size={16} color="#FF4DA6" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Share Your Surprise</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input readOnly value={shareUrl} style={{ flex: 1, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.25)', color: '#fff', fontSize: 13, outline: 'none' }} />
          <button onClick={copy} className="btn-surprise" style={{ padding: '12px 16px', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <Copy size={14} /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* QR code */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ padding: 10, background: '#fff', borderRadius: 12 }}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`} alt="QR code" width={180} height={180} />
          </div>
          <button onClick={downloadQR} style={{ marginTop: 12, padding: '10px 18px', borderRadius: 9999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.3)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <QrCode size={14} /> Download QR Code
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <button onClick={() => window.open(shareUrl, '_blank')} style={shareBtn}><Eye size={16} /><span>Preview</span></button>
          <button onClick={() => window.location.href = `/s/${slug}`} style={shareBtn}><Edit3 size={16} /><span>View</span></button>
          <button onClick={nativeShare} style={shareBtn}><Share2 size={16} /><span>Share</span></button>
          <button onClick={removeSurprise} style={{ ...shareBtn, color: '#FF4DA6', borderColor: 'rgba(255,31,140,0.3)' }}><Trash2 size={16} /><span>Delete</span></button>
        </div>

        {/* Quick share */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>Quick share</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => shareTo('whatsapp')} style={quickBtn}><MessageCircle size={14} /> WhatsApp</button>
            <button onClick={() => shareTo('telegram')} style={quickBtn}><Send size={14} /> Telegram</button>
            <button onClick={() => shareTo('email')} style={quickBtn}><Mail size={14} /> Email</button>
            <button onClick={() => shareTo('sms')} style={quickBtn}><Phone size={14} /> SMS</button>
          </div>
        </div>
      </div>

      <button onClick={onBack} style={{ marginTop: 20, padding: '12px 28px', borderRadius: 9999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Home size={16} /> Back to Home
      </button>
    </div>
  );
}

const shareBtn: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px',
  borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.2)',
  color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
};
const quickBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  borderRadius: 9999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.2)',
  color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
};

// ── Sidebar (extracted) ─────────────────────────────────────────────────────────
function Sidebar({ onBack }: { onBack: () => void }) {
  return (
    <aside style={{ width: 80, background: 'rgba(13,9,24,0.98)', borderRight: '1px solid rgba(139,92,246,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 6, flexShrink: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, gap: 4 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FF1F8C, #C026D3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <path d="M3 11C3 7.5 5.5 5 9 5C10.5 5 11.5 5.5 12 6C12.5 5.5 13.5 5 15 5C18.5 5 21 7.5 21 11C21 16 12 21 12 21C12 21 3 16 3 11Z" fill="white" />
          </svg>
        </div>
      </div>
      {SIDEBAR_ITEMS.map((item, i) => (
        <button
          key={i}
          onClick={item.back ? onBack : undefined}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '10px 8px', borderRadius: 12, width: 64, cursor: 'pointer',
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.45)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,31,140,0.1)'; (e.currentTarget as HTMLElement).style.color = '#FF4DA6'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; }}
        >
          {item.icon}
          <span style={{ fontSize: 9, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 8px', borderRadius: 12, width: 64, cursor: 'pointer' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Star size={16} fill="#fff" stroke="none" />
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#F59E0B', textAlign: 'center', lineHeight: 1.2 }}>Upgrade{'\n'}PRO</span>
      </div>
    </aside>
  );
}

// ── Header (extracted) ─────────────────────────────────────────────────────────
function Header({ playing, setPlaying }: { playing: boolean; setPlaying: (p: boolean) => void }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid rgba(139,92,246,0.12)', background: 'rgba(7,5,15,0.9)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 20, fontWeight: 700, color: '#FF4DA6' }}>Birthday</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '0.15em' }}>Surprise</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setPlaying(!playing)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, background: 'rgba(255,31,140,0.12)', border: '1px solid rgba(255,31,140,0.4)', color: '#FF4DA6', cursor: 'pointer' }}>
          <Music size={14} /> Play Music
        </button>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>
          <Moon size={16} />
        </button>
      </div>
    </header>
  );
}

export default function GenerateSurprise({ onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [createdSlug, setCreatedSlug] = useState('');
  const [playing, setPlaying] = useState(false);
  const [form, setForm] = useState({
    name: '',
    nickname: '',
    yourName: '',
    relationship: '',
    birthdayDate: '',
    theme: 'pink',
    letter: '',
    letterPhoto: null as string | null,
    memories: [] as Memory[],
    videoUrl: '',
    videoFile: null as string | null,
    videoFileName: null as string | null,
    videoTitle: '',
    videoDedication: '',
    usePassword: false,
    password: '',
  });

  const goNext = async () => {
    if (currentStep < 4) { setCurrentStep(currentStep + 1); return; }
    // Final step: save to Supabase
    setSaving(true);
    setSaveError('');
    try {
      const slug = generateSlug(form.name);
      const passwordHash = form.usePassword && form.password ? await hashPassword(form.password) : null;
      const { error } = await supabase.from('surprises').insert({
        slug,
        creator_name: form.yourName || 'Someone',
        recipient_name: form.name || 'Someone Special',
        nickname: form.nickname || null,
        relationship: form.relationship || null,
        birthday_date: form.birthdayDate || null,
        theme: form.theme || 'pink',
        letter: form.letter || null,
        letter_photo_url: form.letterPhoto,
        memories: form.memories,
        video_url: form.videoUrl || null,
        video_file_url: form.videoFile,
        video_title: form.videoTitle || null,
        video_dedication: form.videoDedication || null,
        password_hash: passwordHash,
      });
      if (error) throw error;
      setCreatedSlug(slug);
      setDone(true);
    } catch (e: any) {
      setSaveError(e?.message || 'Could not save your surprise. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  const goPrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else onBack();
  };

  const StepBody = [Step1, Step2, Step3, Step4][currentStep - 1];

  if (done && createdSlug) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#07050F', fontFamily: "'Inter', sans-serif" }}>
        <Sidebar onBack={onBack} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header playing={playing} setPlaying={setPlaying} />
          <ShareScreen slug={createdSlug} onBack={onBack} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#07050F', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar onBack={onBack} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <Header playing={playing} setPlaying={setPlaying} />

        {/* Hero banner */}
        <div style={{ position: 'relative', padding: '24px 28px 20px', background: 'linear-gradient(135deg, rgba(123,63,228,0.25) 0%, rgba(255,31,140,0.15) 100%)', borderBottom: '1px solid rgba(139,92,246,0.12)', overflow: 'hidden', flexShrink: 0 }}>
          {[
            { top: '20%', left: '38%', color: '#FF4DA6', size: 8 },
            { top: '60%', left: '42%', color: '#A78BFA', size: 7 },
            { top: '15%', left: '55%', color: '#FFD700', size: 6 },
            { top: '70%', left: '58%', color: '#60A5FA', size: 8 },
            { top: '30%', left: '68%', color: '#FF4DA6', size: 7 },
          ].map((d, i) => (
            <div key={i} className="animate-twinkle" style={{ position: 'absolute', top: d.top, left: d.left }}>
              <div style={{ width: d.size, height: d.size, transform: 'rotate(45deg)', background: d.color, boxShadow: `0 0 6px ${d.color}` }} />
            </div>
          ))}
          <div style={{ position: 'absolute', right: 40, top: -10, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {[
              { color: '#FF1F8C', size: 52, delay: '0s' },
              { color: '#C026D3', size: 44, delay: '0.6s' },
              { color: '#F59E0B', size: 56, delay: '1.2s' },
              { color: '#A78BFA', size: 48, delay: '0.3s' },
              { color: '#FF4DA6', size: 40, delay: '0.9s' },
            ].map((b, i) => (
              <div key={i} className="animate-float" style={{ animationDelay: b.delay }}>
                <div style={{ width: b.size, height: b.size * 1.2, borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', background: `radial-gradient(circle at 33% 28%, ${b.color}cc, ${b.color}77)`, boxShadow: `0 0 12px ${b.color}55` }}>
                  <div style={{ width: b.size * 0.22, height: b.size * 0.12, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', margin: '18% 0 0 18%' }} />
                </div>
                <div style={{ width: 1, height: 28, background: `${b.color}55`, margin: '0 auto' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <Heart size={20} style={{ color: '#FF4DA6', fill: '#FF4DA6', marginTop: 4 }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
                Create a <span style={{ fontFamily: "'Dancing Script', cursive", color: '#FF4DA6', fontWeight: 700, fontSize: '1.8rem' }}>magical</span> birthday <span style={{ color: '#FF4DA6' }}>surprise</span> ✨
              </h1>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                Fill in the details in simple steps and we'll create an unforgettable surprise website 💌
              </p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div style={{ padding: '20px 28px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step.num === currentStep ? 'linear-gradient(135deg, #FF1F8C, #C026D3)' : step.num < currentStep ? '#FF1F8C' : 'rgba(255,255,255,0.08)',
                    border: step.num > currentStep ? '2px solid rgba(255,255,255,0.15)' : 'none',
                    fontSize: 13, fontWeight: 700,
                    color: step.num <= currentStep ? '#fff' : 'rgba(255,255,255,0.35)',
                    boxShadow: step.num === currentStep ? '0 0 16px rgba(255,31,140,0.5)' : 'none',
                  }}>
                    {step.num < currentStep ? <Check size={14} /> : step.num}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: step.num === currentStep ? 700 : 400, color: step.num === currentStep ? '#fff' : 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, margin: '0 16px', background: step.num < currentStep ? '#FF1F8C' : 'rgba(255,255,255,0.1)', borderRadius: 2 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body: form + preview */}
        <div style={{ display: 'flex', gap: 20, padding: '20px 28px 28px', flex: 1 }}>
          <div style={{ flex: 1, background: 'rgba(13,9,24,0.7)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 18, padding: '24px' }}>
            <StepBody form={form} setForm={setForm} />

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={goPrev}
                style={{
                  padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={goNext}
                disabled={saving}
                className="btn-surprise"
                style={{
                  flex: 1, padding: '14px', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
              >
                {saving ? (
                  <><Loader2 size={18} className="animate-spin" /> Saving...</>
                ) : currentStep === 4 ? (
                  <><Gift size={18} /> Generate Surprise</>
                ) : (
                  <>Continue
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </>
                )}
              </button>
            </div>
            {saveError && (
              <p style={{ marginTop: 10, fontSize: 13, color: '#FF4DA6', textAlign: 'center' }}>{saveError}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              <Lock size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Your information is private and secure</span>
            </div>
          </div>

          {/* Preview panel */}
          <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
            <div style={{ background: 'rgba(13,9,24,0.7)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 18, padding: '20px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Gift size={16} style={{ color: '#FF4DA6' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{PREVIEW_TITLE[currentStep]}</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 14, marginTop: 0 }}>Here's how the surprise will look</p>

              <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, position: 'relative' }}>
                <img
                  src={PREVIEW_IMG[currentStep]}
                  alt="Preview"
                  style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const sib = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                    if (sib) sib.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none', width: '100%', height: 180, background: 'linear-gradient(135deg, #1e0a3c, #3b0764)', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 22, color: '#FF4DA6', fontWeight: 700, textAlign: 'center' }}>Happy Birthday</div>
                  <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 28, color: '#fff', fontWeight: 700 }}>{form.name || 'Someone Special'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {PREVIEW_FEATURES.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${feat.color}15`, border: `1px solid ${feat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {feat.icon}
                    </div>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre-line' }}>{feat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(13,9,24,0.7)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 18, padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Wand2 size={16} style={{ color: '#A78BFA' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>What's Included</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Countdown, animations, music, confetti, balloons, timeline &amp; more!
              </p>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Sparkles size={28} style={{ color: '#A78BFA', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(139,92,246,0.12)', padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexShrink: 0 }}>
          {['100% Secure', 'No Spam', 'Private & Safe'].map((text, i) => (
            <span key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{text}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
