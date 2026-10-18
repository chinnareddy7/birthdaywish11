import { useState, useRef, useCallback } from 'react';
import {
  Home, Gift, LayoutGrid, HelpCircle, Star, Music, Moon,
  User, Heart, Calendar, Palette, ChevronDown, Lock, Sparkles,
  FileText, Image, Video, Wand2, ArrowLeft, Upload, X, Play, Check, PartyPopper,
  Copy, Eye, Trash2, Edit3, Share2, MessageCircle, Send, Mail, Phone, QrCode, Loader2, Plus,
} from 'lucide-react';
import { supabase, hashPassword, generateSlug } from '../lib/supabase';
import { saveSurpriseLocally } from '../lib/storage';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/cropImage';
import SurpriseView from './SurpriseView';

function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

async function uploadVideoToSupabase(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
  const fileName = `videos/video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const contentType = file.type || 'video/mp4';

  const { error } = await supabase.storage
    .from('verification-photos')
    .upload(fileName, file, { contentType, upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('verification-photos')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

async function uploadDataUrlToStorage(dataUrl: string, prefix = 'verification'): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const ext = blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'jpg' : 'png';
  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const { error } = await supabase.storage
    .from('verification-photos')
    .upload(fileName, blob, { contentType: blob.type, upsert: false });

  if (error) {
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from('verification-photos')
    .getPublicUrl(fileName);

  return publicData.publicUrl;
}

interface FormState {
  name: string;
  nickname: string;
  yourName: string;
  relationship: string;
  birthdayDate: string;
  theme: string;
  verificationPhoto: string | null;
  letter: string;
  letterPhoto: string | null;
  memories: Memory[];
  videoUrl: string;
  videoFile: string | null;
  videoFileName: string | null;
  videoRawFile: File | null;
  videoTitle: string;
  videoDedication: string;
  usePassword: boolean;
  password: string;
  balloonMessages: { id: string; message: string; emoji: string; }[];
}

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
  { num: 2, label: 'Birthday Verification' },
  { num: 3, label: 'Birthday Letter' },
  { num: 4, label: 'Beautiful Memories' },
  { num: 5, label: 'Balloon Pop Message' },
  { num: 6, label: 'Special Video' },
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
function Step1({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(123,63,228,0.3), rgba(255,31,140,0.3))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={22} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#FF4DA6', fontWeight: 600, marginBottom: 2 }}>Step 1 of 6</div>
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
function Step2({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(123,63,228,0.3), rgba(255,31,140,0.3))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FileText size={22} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#FF4DA6', fontWeight: 600, marginBottom: 2 }}>Step 3 of 6</div>
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
          if (f) {
            const reader = new FileReader();
            reader.onload = () => setForm({ ...form, letterPhoto: reader.result as string });
            reader.readAsDataURL(f);
          }
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
function Step3({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const memories: Memory[] = form.memories ?? [];

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setUploading(true);

    const newMemories: Memory[] = [];

    for (const file of fileArray) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
        let photoUrl = '';

        const { error: uploadError } = await supabase.storage
          .from('verification-photos')
          .upload(fileName, file, {
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('verification-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrlData.publicUrl;

        newMemories.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: photoUrl,
          caption: '',
        });
      } catch (err) {
        console.warn('Memory upload failed, falling back to base64', err);
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newMemories.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: base64,
          caption: '',
        });
      }
    }

    setForm({ ...form, memories: [...memories, ...newMemories] });
    setUploading(false);
  };

  const removeMemory = (id: string) => {
    setForm({ ...form, memories: memories.filter((m) => m.id !== id) });
  };

  const setCaption = (id: string, caption: string) => {
    setForm({ ...form, memories: memories.map((m) => (m.id === id ? { ...m, caption } : m)) });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fffafb, #ffecee)',
      borderRadius: 24,
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(255, 77, 166, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
      minHeight: 480,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <style>{`
        @keyframes floatHeartStep3 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        @keyframes fadeInUpStep3 {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mem-polaroid {
          animation: fadeInUpStep3 0.4s ease-out forwards;
        }
        .mem-polaroid:hover .mem-remove-btn { opacity: 1 !important; transform: scale(1) !important; }
        .mem-remove-btn { opacity: 0; transform: scale(0.8); transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        
        .beautiful-mem-input::placeholder { color: rgba(255, 77, 133, 0.4); }
      `}</style>
      
      {/* Floating Hearts background */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', opacity: 0.4, animation: 'floatHeartStep3 6s ease-in-out infinite' }}><Heart size={24} color="#ffb3c6" fill="#ffb3c6" /></div>
      <div style={{ position: 'absolute', top: '20%', right: '10%', opacity: 0.3, animation: 'floatHeartStep3 5s ease-in-out infinite 1s' }}><Heart size={16} color="#ff8fab" fill="#ff8fab" /></div>
      <div style={{ position: 'absolute', bottom: '15%', left: '15%', opacity: 0.3, animation: 'floatHeartStep3 7s ease-in-out infinite 2s' }}><Heart size={20} color="#ffb3c6" fill="#ffb3c6" /></div>
      <div style={{ position: 'absolute', bottom: '25%', right: '5%', opacity: 0.4, animation: 'floatHeartStep3 6s ease-in-out infinite 1.5s' }}><Heart size={28} color="#ff8fab" fill="#ff8fab" /></div>
      
      {/* Subtle glowing particles */}
      <div style={{ position: 'absolute', top: '40%', left: '20%', width: 6, height: 6, borderRadius: '50%', background: '#ff99ac', boxShadow: '0 0 10px #ff99ac', opacity: 0.6 }} />
      <div style={{ position: 'absolute', top: '60%', right: '25%', width: 4, height: 4, borderRadius: '50%', background: '#ff99ac', boxShadow: '0 0 8px #ff99ac', opacity: 0.5 }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, marginBottom: 32 }}>
        <h2 style={{ 
          margin: '0 0 8px', 
          fontSize: '2.4rem', 
          fontFamily: "'Dancing Script', cursive", 
          color: '#ff4d85',
          fontWeight: 700,
          textShadow: '0 2px 10px rgba(255, 77, 133, 0.2)'
        }}>
          Beautiful Memories
        </h2>
        <p style={{ 
          margin: 0, 
          fontSize: '1.2rem', 
          fontFamily: "'Dancing Script', cursive", 
          color: '#ff75a0',
          fontWeight: 600
        }}>
          A little collection of moments worth keeping ❤️
        </p>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => addFiles(e.target.files)} />

      {memories.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flex: 1,
          width: '100%',
          animation: 'fadeInUpStep3 0.5s ease-out',
          zIndex: 10
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✨</div>
          <h3 style={{ margin: '0 0 8px', color: '#ff4d85', fontSize: '1.3rem', fontWeight: 700 }}>Your memories belong here</h3>
          <p style={{ margin: '0 0 28px', color: '#ff8fab', textAlign: 'center', fontSize: '1rem', maxWidth: 260, lineHeight: 1.5, fontWeight: 500 }}>
            Add the moments that make this birthday special ❤️
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '16px 36px',
              borderRadius: 50,
              background: 'linear-gradient(135deg, #ff75a0, #ff4d85)',
              border: 'none',
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: uploading ? 'wait' : 'pointer',
              opacity: uploading ? 0.7 : 1,
              boxShadow: '0 8px 24px rgba(255, 77, 133, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(255, 77, 133, 0.45)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 77, 133, 0.35)'; }}
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />} {uploading ? 'Uploading...' : 'Add Photos'}
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
             <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                padding: '12px 28px',
                borderRadius: 50,
                background: '#fff',
                border: '2px dashed #ff99ac',
                color: '#ff4d85',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: uploading ? 'wait' : 'pointer',
                opacity: uploading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(255, 77, 133, 0.08)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fff0f3'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} {uploading ? 'Uploading...' : 'Add More Photos'}
            </button>
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '24px 16px', 
            padding: '10px 0 20px',
            width: '100%' 
          }}>
            {memories.map((m, i) => {
              const rotations = [-5, 4, -3, 6, -4, 3, -6, 5];
              const rot = rotations[i % rotations.length];
              return (
                <div key={m.id} className="mem-polaroid" style={{
                  position: 'relative',
                  width: 140,
                  background: '#fff',
                  padding: '8px 8px 12px 8px',
                  borderRadius: 4,
                  boxShadow: '0 6px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
                  transform: `rotate(${rot}deg)`,
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = `scale(1.1) rotate(0deg) translateY(-8px)`;
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.12), 0 5px 10px rgba(0,0,0,0.08)';
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `rotate(${rot}deg)`;
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)';
                  e.currentTarget.style.zIndex = '1';
                }}
                >
                  <img src={m.url} alt="Memory" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2, display: 'block' }} />
                  <input
                    className="beautiful-mem-input"
                    value={m.caption || ''}
                    onChange={(e) => setCaption(m.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Add caption..."
                    style={{
                      width: '100%',
                      padding: '8px 4px 0',
                      background: 'transparent',
                      border: 'none',
                      color: '#ff4d85',
                      fontSize: '0.95rem',
                      fontFamily: "'Dancing Script', cursive",
                      fontWeight: 600,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeMemory(m.id); }} 
                    className="mem-remove-btn"
                    style={{ 
                      position: 'absolute', 
                      top: -12, 
                      right: -12, 
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      background: '#fff', 
                      border: '1px solid #ffe1e8',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                      color: '#ff4d85', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fff0f3'; e.currentTarget.style.color = '#e6005c'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#ff4d85'; }}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
          
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <h4 style={{ margin: 0, color: '#ff4d85', fontSize: '1.4rem', fontWeight: 700, fontFamily: "'Dancing Script', cursive", textShadow: '0 1px 4px rgba(255, 77, 133, 0.1)' }}>
              {memories.length} Beautiful {memories.length === 1 ? 'Memory' : 'Memories'} ❤️
            </h4>
          </div>
        </div>
      )}
    </div>
  );
}

// ── New Step: Password & Photo ────────────────────────────────────────────────
function PasswordPhotoStep({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [shape, setShape] = useState<string>('circle');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedImage(dataUrl);
      // Immediately preserve the uploaded photo in form state so it is never lost even if user doesn't crop
      setForm({ ...form, verificationPhoto: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPx: any) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleApply = async () => {
    if (!selectedImage || !croppedAreaPixels || !originalFile) return;

    try {
      setUploading(true);
      const croppedImageBase64 = await getCroppedImg(selectedImage, croppedAreaPixels, 0, { horizontal: false, vertical: false }, shape);

      const fileExt = originalFile.name.split('.').pop() || 'jpg';
      const originalFileName = `original-${Date.now()}.${fileExt}`;
      const finalFileName = `verification-${Date.now()}.png`;

      let originalUrl = selectedImage;
      let finalUrl = croppedImageBase64;

      try {
        // Upload original
        const { error: err1 } = await supabase.storage.from('verification-photos').upload(originalFileName, originalFile, { upsert: false });
        if (!err1) {
          originalUrl = supabase.storage.from('verification-photos').getPublicUrl(originalFileName).data.publicUrl;
        }

        // Upload final png
        const blob = dataUrlToBlob(croppedImageBase64);
        const croppedFile = new File([blob], finalFileName, { type: 'image/png' });

        const { error: err2 } = await supabase.storage.from('verification-photos').upload(finalFileName, croppedFile, { contentType: 'image/png', upsert: false });
        if (!err2) {
          finalUrl = supabase.storage.from('verification-photos').getPublicUrl(finalFileName).data.publicUrl;
        }
      } catch (storageErr) {
        console.warn('Supabase storage upload failed, using local base64:', storageErr);
      }

      const configJson = JSON.stringify({
        originalUrl: originalUrl && originalUrl.startsWith('http') ? originalUrl : undefined,
        finalUrl,
        config: { shape, crop, zoom, objectFit }
      });

      setForm({ ...form, verificationPhoto: configJson });
      setSelectedImage(null);
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    } finally {
      setUploading(false);
    }
  };

  const shapes = [
    { id: 'rect', label: 'Rectangle' },
    { id: 'square', label: 'Square' },
    { id: 'rounded-rectangle', label: 'Rounded Rectangle' },
    { id: 'circle', label: 'Circle' },
    { id: 'oval', label: 'Oval' },
    { id: 'heart', label: 'Heart' },
    { id: 'triangle', label: 'Triangle' },
    { id: 'hexagon', label: 'Hexagon' },
    { id: 'star', label: 'Star' },
  ];

  const getClipPath = (s: string) => {
    switch (s) {
      case 'circle': return 'circle(50% at 50% 50%)';
      case 'oval': return 'ellipse(50% 50% at 50% 50%)';
      case 'rounded-rectangle': return 'inset(0 round 15%)';
      case 'heart': return 'path("M 50 25 C 50 10, 10 5, 5 35 C 0 60, 30 70, 50 95 C 70 70, 100 60, 95 35 C 90 5, 50 10, 50 25 Z")';
      case 'triangle': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      case 'star': return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      case 'square': return 'inset(0)';
      default: return 'inset(0)';
    }
  };

  let displayUrl = form.verificationPhoto;
  if (displayUrl && displayUrl.startsWith('{')) {
    try {
      displayUrl = JSON.parse(displayUrl).finalUrl;
    } catch (e) {}
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(123,63,228,0.3), rgba(255,31,140,0.3))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Lock size={22} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#FF4DA6', fontWeight: 600, marginBottom: 2 }}>Step 2 of 6</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Birthday Verification</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Add a personal photo and protect the surprise with a birthday password. 💖</p>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>Personal Photo</label>

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />

        {selectedImage ? (
          <div style={{ background: 'rgba(13,9,24,0.9)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Shape</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {shapes.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    style={{
                      padding: '6px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: shape === s.id ? 'rgba(255,31,140,0.15)' : 'rgba(255,255,255,0.04)',
                      border: shape === s.id ? '1px solid rgba(255,31,140,0.5)' : '1px solid rgba(139,92,246,0.2)',
                      color: shape === s.id ? '#FF4DA6' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', width: '100%', height: 300, background: '#000', overflow: 'hidden' }}>
              <style>{`
                .reactEasyCrop_CropArea {
                  clip-path: ${getClipPath(shape)} !important;
                }
                .reactEasyCrop_Container {
                  background-color: #000;
                }
              `}</style>
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={shape === 'square' || shape === 'circle' || shape === 'heart' || shape === 'star' ? 1 : undefined}
                objectFit={objectFit}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#fff' }}>Zoom:</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#FF4DA6' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setObjectFit(objectFit === 'cover' ? 'contain' : 'cover')}
                  style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: 13, cursor: 'pointer' }}
                >
                  Mode: {objectFit === 'cover' ? 'Fill' : 'Fit'}
                </button>
                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: 'none', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={uploading}
                  style={{ padding: '8px 20px', borderRadius: 8, background: '#FF4DA6', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: uploading ? 'wait' : 'pointer' }}
                >
                  {uploading ? 'Applying...' : 'Apply Customization'}
                </button>
              </div>
            </div>
          </div>
        ) : displayUrl ? (
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,31,140,0.35)', boxShadow: '0 0 25px rgba(255,31,140,0.15)', display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', padding: 20 }}>
            <img src={displayUrl} alt="Birthday verification" style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain', display: 'block' }} />
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{ padding: '6px 12px', borderRadius: 9999, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Edit3 size={14} /> Change
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, verificationPhoto: null })}
                style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{ width: '100%', padding: '32px 20px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,31,140,0.06), rgba(167,139,250,0.06))', border: '2px dashed rgba(139,92,246,0.35)', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, fontSize: 13 }}
          >
            <Upload size={28} style={{ color: '#FF4DA6' }} />
            <span style={{ color: '#fff', fontWeight: 600 }}>Upload Personal Photo</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>This photo will appear on the birthday verification page.</span>
          </button>
        )}
      </div>
    </>
  );
}

// ── Step 4: Special Video ──────────────────────────────────────────────────────
function Step4({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const youtubeId = (() => {
    const m = (form.videoUrl ?? '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  })();

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Local preview immediately so creator can view it right away
    const previewUrl = URL.createObjectURL(f);
    setForm({
      ...form,
      videoFile: previewUrl,
      videoFileName: f.name,
      videoRawFile: f,
    });
    setUploadingVideo(true);
    setUploadError(null);

    try {
      const publicUrl = await uploadVideoToSupabase(f);
      setForm({
        ...form,
        videoFile: publicUrl,
        videoFileName: f.name,
        videoRawFile: null,
      });
    } catch (err: any) {
      console.warn('Video cloud upload note:', err);
      setUploadError('Uploading in background. Your video will be securely saved when you generate the surprise.');
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(123,63,228,0.3), rgba(255,31,140,0.3))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Video size={22} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#FF4DA6', fontWeight: 600, marginBottom: 2 }}>Step 6 of 6</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Special Video</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Add a video message or a favorite clip. 🎬</p>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Video URL (YouTube or direct video link)</label>
        <InputField icon={<Play size={16} />} placeholder="Paste a YouTube or video link" value={form.videoUrl} onChange={(v) => setForm({ ...form, videoUrl: v })} />
        {form.videoUrl && (
          <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.25)' }}>
            {youtubeId ? (
              <iframe
                width="100%"
                height="220"
                src={`https://www.youtube.com/embed/${youtubeId}?playsinline=1`}
                title="Video preview"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{ padding: 18, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Video size={18} color="#FF4DA6" />
                <span>Direct video link added: {form.videoUrl}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>Or Upload a Video</label>
        <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoFileChange} />
        {form.videoFile ? (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.3)', background: '#000' }}>
            <video src={form.videoFile} controls playsInline style={{ width: '100%', maxHeight: 240, display: 'block' }} />
            {uploadingVideo && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#fff', fontSize: 13, zIndex: 4 }}>
                <Loader2 size={28} className="animate-spin" color="#FF4DA6" />
                <span>Uploading video to cloud storage...</span>
              </div>
            )}
            <button
              onClick={() => setForm({ ...form, videoFile: null, videoFileName: null, videoRawFile: null })}
              style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
            >
              <X size={16} />
            </button>
            {form.videoFile.startsWith('http') && (
              <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(16, 185, 129, 0.85)', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, zIndex: 5 }}>
                <Check size={12} /> Saved to cloud storage
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '24px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(139,92,246,0.3)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Upload size={24} style={{ color: '#A78BFA' }} />
            Click to upload a video
          </button>
        )}
        {uploadError && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#FF4DA6' }}>
            {uploadError}
          </div>
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
    </>
  );
}



function BalloonMessageStep({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {

  const addMessage = () => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setForm({ ...form, balloonMessages: [...form.balloonMessages, { id, message: '', emoji: '🎈' }] });
  };
  const updateMessage = (id: string, field: 'message' | 'emoji', value: string) => {
    setForm({
      ...form,
      balloonMessages: form.balloonMessages.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    });
  };
  const removeMessage = (id: string) => {
    setForm({ ...form, balloonMessages: form.balloonMessages.filter((m) => m.id !== id) });
  };
  const EMOJIS = ['🎈', '🎉', '🥳', '❤️', '🍰'];
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(123,63,228,0.3), rgba(255,31,140,0.3))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PartyPopper size={22} style={{ color: '#A78BFA' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#FF4DA6', fontWeight: 600, marginBottom: 2 }}>Step 5 of 6</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Balloon Pop Message</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Customize messages shown after each balloon is popped.</p>
        </div>
      </div>

      {form.balloonMessages.map((msg) => (
        <div key={msg.id} style={{ marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(139,92,246,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <select
              value={msg.emoji}
              onChange={(e) => updateMessage(msg.id, 'emoji', e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 6, color: '#fff', padding: '4px 8px' }}
            >
              {EMOJIS.map((e) => (
                <option key={e} value={e} style={{ background: '#1a0f2e' }}>
                  {e}
                </option>
              ))}
            </select>
            <button onClick={() => removeMessage(msg.id)} style={{ background: 'transparent', border: 'none', color: '#FF4DA6', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
          <InputField
            icon={<MessageCircle size={16} />}
            placeholder="Enter your message"
            value={msg.message}
            onChange={(v) => updateMessage(msg.id, 'message', v)}
          />
          <div style={{ marginTop: 10, padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.05)' }}>
            <strong>Preview:</strong> {msg.emoji} {msg.message}
          </div>
        </div>
      ))}

      <button onClick={addMessage} style={{ padding: '8px 16px', borderRadius: 9999, background: 'rgba(255,31,140,0.15)', border: '1px solid rgba(255,31,140,0.5)', color: '#FF4DA6', fontWeight: 600, cursor: 'pointer' }}>
        + Add Message
      </button>
    </>
  );
}
// ── Share screen ───────────────────────────────────────────────────────────────
function ShareScreen({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [previewPhase, setPreviewPhase] = useState<string | null>(null);
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
    const img = new window.Image();
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

  if (previewPhase) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100000, background: '#07050F' }}>
        <SurpriseView slug={slug} previewMode={previewPhase} onBackFromPreview={() => setPreviewPhase(null)} />
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

        {/* Preview Your Surprise */}
        <div style={{ marginTop: 24, borderTop: '1px solid rgba(139,92,246,0.15)', paddingTop: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={16} color="#A78BFA" /> Preview Your Surprise
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setPreviewPhase('birthday-film')} style={previewBtn}>Preview Heart Arrow</button>
            <button onClick={() => setPreviewPhase('cake-animation')} style={previewBtn}>Preview Cake Animation</button>
            <button onClick={() => setPreviewPhase('balloon-reasons')} style={previewBtn}>Preview Balloon Pop</button>
            <button onClick={() => setPreviewPhase('letter')} style={previewBtn}>Preview Letter</button>
            <button onClick={() => setPreviewPhase('memories')} style={previewBtn}>Preview Beautiful Memories</button>
            <button onClick={() => setPreviewPhase('video')} style={previewBtn}>Preview Special Video</button>
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
const previewBtn: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(139,92,246,0.15)',
  color: 'rgba(255,255,255,0.7)',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'center',
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
  const [form, setForm] = useState<FormState>({
    name: '',
    nickname: '',
    yourName: '',
    relationship: '',
    birthdayDate: '',
    theme: 'pink',
    verificationPhoto: null as string | null,
    letter: '',
    letterPhoto: null as string | null,
    memories: [] as Memory[],
    videoUrl: '',
    videoFile: null as string | null,
    videoFileName: null as string | null,
    videoRawFile: null as File | null,
    videoTitle: '',
    videoDedication: '',
    usePassword: false,
    password: '',
    balloonMessages: [] as { id: string; message: string; emoji: string; }[],
  });

  const goNext = async () => {
    if (currentStep < 6) { setCurrentStep(currentStep + 1); return; }
    // Final step: save to Supabase
    setSaving(true);
    setSaveError('');
    try {
      const slug = generateSlug(form.name);
      const passwordHash = form.usePassword && form.password ? await hashPassword(form.password) : null;

      // 1. Guarantee video is stored persistently in Supabase Cloud Storage (not temporary blob)
      let persistentVideoUrl = form.videoFile;
      if (form.videoRawFile) {
        try {
          persistentVideoUrl = await uploadVideoToSupabase(form.videoRawFile);
        } catch (videoErr: any) {
          throw new Error(`Cloud storage video upload failed: ${videoErr.message}. Please check your connection and try again.`);
        }
      } else if (persistentVideoUrl && persistentVideoUrl.startsWith('blob:')) {
        // Blob URLs cannot be accessed by other browsers/devices
        persistentVideoUrl = null;
      }

      // 2. Guarantee verification photo is stored in Supabase Cloud Storage
      let persistentPhotoUrl = form.verificationPhoto;
      if (persistentPhotoUrl) {
        try {
          if (persistentPhotoUrl.startsWith('{')) {
            const parsed = JSON.parse(persistentPhotoUrl);
            if (parsed.finalUrl && parsed.finalUrl.startsWith('data:image/')) {
              const uploaded = await uploadDataUrlToStorage(parsed.finalUrl, 'verification-final');
              parsed.finalUrl = uploaded;
              persistentPhotoUrl = JSON.stringify(parsed);
            }
          } else if (persistentPhotoUrl.startsWith('data:image/')) {
            const uploaded = await uploadDataUrlToStorage(persistentPhotoUrl, 'verification-photo');
            persistentPhotoUrl = uploaded;
          }
        } catch (photoErr) {
          console.warn('Could not upload verification photo to storage, keeping payload:', photoErr);
        }
      }

      const surprisePayload = {
        slug,
        creator_name: form.yourName || 'Someone',
        recipient_name: form.name || 'Someone Special',
        nickname: form.nickname || null,
        relationship: form.relationship || null,
        birthday_date: form.birthdayDate || null,
        verification_photo_url: persistentPhotoUrl,
        theme: form.theme || 'pink',
        letter: form.letter || null,
        letter_photo_url: form.letterPhoto,
        memories: form.memories,
        video_url: form.videoUrl || null,
        video_file_url: persistentVideoUrl,
        video_title: form.videoTitle || null,
        video_dedication: form.videoDedication || null,
        balloon_personal_message: JSON.stringify(form.balloonMessages),
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
      };

      await saveSurpriseLocally(`surprise_${slug}`, { id: `surp_${Date.now()}`, ...surprisePayload });

      try {
        const { data: insertedData, error } = await supabase.from('surprises').insert(surprisePayload).select().maybeSingle();
        if (error) {
          console.warn('Supabase insert note:', error);
          if (error.message?.includes('balloon_') || error.code === '42703') {
            const { balloon_personal_message, ...corePayload } = surprisePayload as Record<string, unknown>;
            const retry = await supabase.from('surprises').insert(corePayload).select().maybeSingle();
            if (retry.data) {
              await saveSurpriseLocally(`surprise_${slug}`, { ...retry.data, balloon_personal_message });
            }
          }
        } else if (insertedData) {
          await saveSurpriseLocally(`surprise_${slug}`, insertedData);
        }
      } catch (networkErr) {
        console.warn('Supabase unreachable, using local storage fallback:', networkErr);
      }

      setCreatedSlug(slug);
      setDone(true);
    } catch (e: unknown) {
      console.error('SAVE SURPRISE ERROR:', e);
      setSaveError(
        e instanceof Error
          ? e.message
          : JSON.stringify(e)
      );
    } finally {
      setSaving(false);
    }
  };
  const goPrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else onBack();
  };

  const StepBody = [
    Step1,
    PasswordPhotoStep,
    Step2,
    Step3,
    BalloonMessageStep,
    Step4,
  ][currentStep - 1];

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
                ) : currentStep === 6 ? (
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
