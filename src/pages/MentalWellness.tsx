import React, { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// ─── Types ────────────────────────────────────────────────────────────────────

type MoodLevel = 1 | 2 | 3 | 4 | 5;
type TabId = 'chat' | 'journal' | 'breathing' | 'resources';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface JournalEntry {
  id: string;
  date: string;
  mood: MoodLevel;
  note: string;
}

// ─── Demo AI Responses ────────────────────────────────────────────────────────

const DEMO_RESPONSES: Record<string, string> = {
  default: "Thank you for sharing that with me. I'm here to listen and support you. Remember, this is a safe space — everything you share stays private. How are you feeling right now on a scale of 1 to 5?",
  stressed: "It sounds like you're dealing with a lot of stress. That's completely understandable. Some things that can help in the moment: take three slow deep breaths, step outside for a few minutes, or write down what's on your mind. Would you like to try a breathing exercise together?",
  sad: "I hear you, and I want you to know your feelings are valid. Sadness is a natural human emotion. Have you been able to talk to anyone you trust about how you're feeling? If you're ever feeling overwhelmed, please remember you can reach the 988 Lifeline anytime.",
  anxious: "Anxiety can feel really overwhelming. One technique that many people find helpful is the 5-4-3-2-1 grounding method: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Would you like to walk through it together?",
  happy: "That's wonderful to hear! 😊 It's great that you're feeling positive. Would you like to journal about this feeling so you can look back on it later? Capturing good moments can be really helpful during harder times.",
  tired: "Fatigue — both physical and emotional — is real and valid. Have you been getting enough sleep? Sometimes our bodies need rest before our minds can process things clearly. What does your sleep routine look like lately?",
  lonely: "Feeling lonely can be really painful. You're not alone in feeling this way — many people experience loneliness, especially during life transitions. Is there someone you could reach out to today, even with a small message?",
  help: "I'm here to help you in any way I can. I can listen, guide you through breathing exercises, help you journal your feelings, or connect you with professional resources. What would feel most helpful right now?",
  crisis: "I'm really concerned about what you're sharing. Please know you don't have to face this alone. I strongly encourage you to reach out to the 988 Suicide & Crisis Lifeline right now — just call or text **988**. They have trained counselors available 24/7 and they care about you.",
};

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.match(/\b(suicid|self[- ]?harm|harm myself|hurt myself|kill myself|end my life|end it all|want to die|wanna die|better off dead|no reason to live|cut myself)/)) return DEMO_RESPONSES.crisis;
  if (lower.match(/\b(stress|overwhelm|too much|pressure)/)) return DEMO_RESPONSES.stressed;
  if (lower.match(/\b(sad|depress|cry|hopeless|empty)/)) return DEMO_RESPONSES.sad;
  if (lower.match(/\b(anxi|panic|worr|scared|nervous|fear)/)) return DEMO_RESPONSES.anxious;
  if (lower.match(/\b(happy|great|wonderful|excit|joy|grateful|proud)/)) return DEMO_RESPONSES.happy;
  if (lower.match(/\b(tired|exhaust|drain|fatigue|sleep|insomnia)/)) return DEMO_RESPONSES.tired;
  if (lower.match(/\b(lone|alone|isol|nobody|no one)/)) return DEMO_RESPONSES.lonely;
  if (lower.match(/\b(help|support|advice|what should|how do)/)) return DEMO_RESPONSES.help;
  return DEMO_RESPONSES.default;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  text: "Hi, I'm your HealthBridge Wellness AI 💙\n\nThis is a safe, private space to check in with yourself. I'm here to listen, support, and guide you — not replace a therapist or medical professional.\n\nHow are you feeling today?",
  timestamp: new Date(),
};

const DEMO_JOURNAL: JournalEntry[] = [
  { id: 'j1', date: 'Nov 8, 2026', mood: 4, note: 'Had a good morning. Felt energized after a walk. Work was stressful in the afternoon but managed it well. (Demo entry)' },
  { id: 'j2', date: 'Nov 7, 2026', mood: 3, note: 'Neutral day overall. Talked to a friend which helped. Feeling a bit tired by evening. (Demo entry)' },
  { id: 'j3', date: 'Nov 6, 2026', mood: 2, note: 'Difficult day. Felt anxious about a lot of things. Did the breathing exercise and felt a bit better. (Demo entry)' },
  { id: 'j4', date: 'Nov 5, 2026', mood: 5, note: 'Really great day! Spent time outside, cooked a healthy meal, called family. Feeling grateful. (Demo entry)' },
  { id: 'j5', date: 'Nov 4, 2026', mood: 3, note: 'Average day. Nothing remarkable but nothing bad either. Need more sleep. (Demo entry)' },
];

const MOOD_CONFIG: Record<MoodLevel, { emoji: string; label: string; color: string; bg: string; border: string; barColor: string }> = {
  1: { emoji: '😞', label: 'Very Low', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', barColor: 'bg-red-400' },
  2: { emoji: '😕', label: 'Low', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', barColor: 'bg-orange-400' },
  3: { emoji: '😐', label: 'Neutral', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', barColor: 'bg-yellow-400' },
  4: { emoji: '🙂', label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', barColor: 'bg-blue-400' },
  5: { emoji: '😄', label: 'Great', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', barColor: 'bg-success-500' },
};

// ─── Crisis Banner ────────────────────────────────────────────────────────────

const CrisisBanner: React.FC = () => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-red-800">In crisis or need immediate support?</p>
        <p className="text-xs text-red-600 mt-0.5">Call or text <strong>988</strong> (Suicide & Crisis Lifeline) — free, confidential, available 24/7</p>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <a href="tel:988" onClick={e => e.preventDefault()} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Call 988
      </a>
      <a href="sms:988" onClick={e => e.preventDefault()} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors">
        Text 988
      </a>
    </div>
  </div>
);

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

const ChatTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const reply: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: getResponse(text), timestamp: new Date() };
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const QUICK_PROMPTS = ["I'm feeling anxious today", "I need some motivation", "I can't sleep well", "I'm feeling overwhelmed", "Tell me a breathing exercise", "I want to journal my feelings"];

  return (
    <div className="flex flex-col h-full">
      {/* Demo notice */}
      <div className="flex items-center gap-2 px-4 py-2 bg-accent-50 border-b border-accent-100">
        <svg className="w-3.5 h-3.5 text-accent-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p className="text-[11px] text-accent-700 font-medium">Demo AI — Responses are pre-scripted. Not a substitute for professional mental health care.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${msg.role === 'assistant' ? 'bg-gradient-to-br from-accent-500 to-primary-600 text-white' : 'bg-gradient-to-br from-primary-500 to-accent-600 text-white'}`}>
              {msg.role === 'assistant' ? '💙' : 'D'}
            </div>
            {/* Bubble */}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'assistant' ? 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm' : 'bg-primary-600 text-white rounded-tr-sm'}`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-400 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-primary-600 flex items-center justify-center text-sm flex-shrink-0">💙</div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-[11px] text-gray-400 mb-2">Quick starts:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => { setInput(p); }} className="text-xs font-medium px-3 py-1.5 bg-accent-50 hover:bg-accent-100 text-accent-700 border border-accent-200 rounded-full transition-colors">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Share how you're feeling... (Press Enter to send)"
            rows={2}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-accent-400 bg-gray-50 focus:bg-white transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="flex-shrink-0 w-10 h-10 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          This AI is for demonstration only. For real support call/text <strong>988</strong> or visit <strong>988lifeline.org</strong>
        </p>
      </div>
    </div>
  );
};

// ─── Mood Journal Tab ─────────────────────────────────────────────────────────

const JournalTab: React.FC = () => {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>('hb_journal', DEMO_JOURNAL);
  const [mood, setMood] = useState<MoodLevel>(3);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSave = () => {
    if (!note.trim()) return;
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      mood,
      note,
    };
    setEntries(prev => [newEntry, ...prev]);
    setNote('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Mood trend: last 7 entries
  const trend = entries.slice(0, 7).reverse();

  return (
    <div className="p-5 space-y-5 overflow-y-auto scrollbar-hide">
      {/* Mood trend chart */}
      <div className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-2xl border border-accent-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Your Mood Trend</h4>
            <p className="text-[11px] text-gray-500">Last {trend.length} journal entries (Demo)</p>
          </div>
          <span className="text-2xl">{MOOD_CONFIG[mood].emoji}</span>
        </div>
        <div className="flex items-end gap-2 h-12">
          {trend.map((e) => {
            const mc = MOOD_CONFIG[e.mood];
            const heightPct = (e.mood / 5) * 100;
            return (
              <div key={e.id} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full flex items-end justify-center" style={{ height: 48 }}>
                  <div className={`w-full rounded-t-sm ${mc.barColor} transition-all`} style={{ height: `${heightPct}%` }} />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-gray-800 text-white px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                    {mc.label}
                  </div>
                </div>
                <span className="text-[9px] text-gray-400">{e.date.split(' ')[1].replace(',', '')}/{e.date.split(' ')[0].substring(0, 3)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-accent-100">
          <span className="text-[11px] text-gray-500">Average: <span className="font-bold text-accent-700">{trend.length ? `${(trend.reduce((s, e) => s + e.mood, 0) / trend.length).toFixed(1)}/5.0` : 'No entries yet'}</span></span>
          <span className="text-[10px] text-gray-400">Demo Data Only</span>
        </div>
      </div>

      {/* New entry form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
        <h4 className="text-sm font-bold text-gray-900 mb-3">📝 Add Today's Entry</h4>

        {/* Mood selector */}
        <p className="text-xs font-semibold text-gray-600 mb-2">How are you feeling right now?</p>
        <div className="flex items-center gap-2 mb-4">
          {([1, 2, 3, 4, 5] as MoodLevel[]).map(m => {
            const mc = MOOD_CONFIG[m];
            return (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${mood === m ? `${mc.bg} ${mc.border} scale-105` : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}
              >
                <span className="text-xl">{mc.emoji}</span>
                <span className={`text-[10px] font-semibold ${mood === m ? mc.color : 'text-gray-400'}`}>{mc.label}</span>
              </button>
            );
          })}
        </div>

        {/* Note textarea */}
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Write about your day, how you're feeling, what's on your mind... (this is your private space)"
          rows={4}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-accent-400 bg-gray-50 focus:bg-white transition-all mb-3"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!note.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {saved ? (
              <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/></svg>Saved!</>
            ) : (
              <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save Entry</>
            )}
          </button>
          <span className="text-xs text-gray-400">{note.length} chars · Your entries are private (Demo)</span>
        </div>
      </div>

      {/* Past entries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-900">Past Entries</h4>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">DEMO DATA</span>
        </div>
        <div className="space-y-2">
          {entries.map(e => {
            const mc = MOOD_CONFIG[e.mood];
            const isExpanded = expandedId === e.id;
            return (
              <div key={e.id}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : e.id)}
                className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-card transition-all p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${mc.bg} ${mc.border} border flex items-center justify-center text-lg flex-shrink-0`}>
                    {mc.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700">{e.date}</span>
                      <span className={`text-[10px] font-semibold ${mc.color}`}>{mc.label}</span>
                    </div>
                    <p className={`text-xs text-gray-500 mt-0.5 ${isExpanded ? '' : 'truncate'}`}>{e.note}</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
              {isExpanded && (
                <div className="flex justify-end px-3 pt-1.5">
                  <button
                    onClick={() => { setEntries(prev => prev.filter(x => x.id !== e.id)); setExpandedId(null); }}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    Delete entry
                  </button>
                </div>
              )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Breathing Exercise Tab ───────────────────────────────────────────────────

type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATHING_TECHNIQUES = [
  { id: '4-7-8', name: '4-7-8 Breathing', desc: 'Relaxation technique for sleep & anxiety', inhale: 4, hold: 7, exhale: 8, rest: 0, color: 'from-accent-500 to-primary-600' },
  { id: 'box', name: 'Box Breathing', desc: 'Used by Navy SEALs for stress control', inhale: 4, hold: 4, exhale: 4, rest: 4, color: 'from-primary-500 to-primary-700' },
  { id: '5-5', name: '5-5 Breathing', desc: 'Simple equal-breath for beginners', inhale: 5, hold: 0, exhale: 5, rest: 0, color: 'from-success-500 to-success-700' },
];

const BreathingTab: React.FC = () => {
  const [technique, setTechnique] = useState(BREATHING_TECHNIQUES[0]);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalCycles, setTotalCycles] = useState(4);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  const phaseConfig: Record<BreathPhase, { label: string; instruction: string; scale: string; opacity: string }> = {
    idle: { label: '', instruction: 'Press Start to begin', scale: 'scale-75', opacity: 'opacity-60' },
    inhale: { label: 'Inhale', instruction: 'Breathe in slowly through your nose', scale: 'scale-100', opacity: 'opacity-100' },
    hold: { label: 'Hold', instruction: 'Hold your breath gently', scale: 'scale-100', opacity: 'opacity-90' },
    exhale: { label: 'Exhale', instruction: 'Breathe out slowly through your mouth', scale: 'scale-75', opacity: 'opacity-80' },
    rest: { label: 'Rest', instruction: 'Rest before the next breath', scale: 'scale-75', opacity: 'opacity-70' },
  };

  const runPhase = (p: BreathPhase, duration: number, cb: () => void) => {
    if (!runningRef.current) return;
    setPhase(p);
    setCountdown(duration);
    let remaining = duration;
    const tick = () => {
      if (!runningRef.current) return;
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) { cb(); } else { timerRef.current = setTimeout(tick, 1000); }
    };
    timerRef.current = setTimeout(tick, 1000);
  };

  const runCycle = (cycleNum: number) => {
    if (!runningRef.current || cycleNum >= totalCycles) {
      setPhase('idle'); setCycles(0); runningRef.current = false; return;
    }
    setCycles(cycleNum + 1);
    runPhase('inhale', technique.inhale, () => {
      if (technique.hold > 0) {
        runPhase('hold', technique.hold, () => {
          runPhase('exhale', technique.exhale, () => {
            if (technique.rest > 0) { runPhase('rest', technique.rest, () => runCycle(cycleNum + 1)); }
            else { runCycle(cycleNum + 1); }
          });
        });
      } else {
        runPhase('exhale', technique.exhale, () => runCycle(cycleNum + 1));
      }
    });
  };

  const start = () => { runningRef.current = true; setCycles(0); runCycle(0); };
  const stop = () => {
    runningRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle'); setCycles(0); setCountdown(0);
  };

  useEffect(() => () => { runningRef.current = false; if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const pc = phaseConfig[phase];
  const isActive = phase !== 'idle';

  const phaseColors: Record<BreathPhase, string> = {
    idle: 'from-gray-200 to-gray-300',
    inhale: 'from-primary-400 to-accent-500',
    hold: 'from-accent-400 to-accent-600',
    exhale: 'from-success-400 to-primary-500',
    rest: 'from-gray-300 to-gray-400',
  };

  return (
    <div className="p-5 space-y-5 overflow-y-auto scrollbar-hide">
      {/* Technique selector */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-3">Choose a Technique</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {BREATHING_TECHNIQUES.map(t => (
            <button
              key={t.id}
              onClick={() => { stop(); setTechnique(t); }}
              disabled={isActive}
              className={`text-left p-3 rounded-xl border-2 transition-all ${technique.id === t.id ? 'border-accent-400 bg-accent-50' : 'border-gray-100 bg-white hover:border-gray-200'} ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`text-sm font-bold bg-gradient-to-r ${t.color} bg-clip-text text-transparent`}>{t.name}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{t.desc}</div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {([['Inhale', t.inhale], ['Hold', t.hold], ['Exhale', t.exhale], ['Rest', t.rest]] as [string, number][]).filter(([, v]) => v > 0).map(([label, val]) => (
                  <span key={label as string} className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{label} {val}s</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Animated circle */}
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="relative flex items-center justify-center w-52 h-52">
          {/* Outer pulse ring */}
          {isActive && (
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${phaseColors[phase]} opacity-20 animate-ping`} style={{ animationDuration: '2s' }} />
          )}
          {/* Mid ring */}
          <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${phaseColors[phase]} opacity-10 transition-all duration-1000`} />
          {/* Main circle */}
          <div className={`relative flex flex-col items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br ${phaseColors[phase]} shadow-lg transition-all duration-1000 ${pc.scale} ${pc.opacity}`}>
            <span className="text-3xl font-bold text-white">{isActive && countdown > 0 ? countdown : ''}</span>
            <span className="text-sm font-bold text-white/90 mt-0.5">{pc.label || (isActive ? '' : '🌬️')}</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-gray-800">{pc.instruction}</p>
          {isActive && (
            <p className="text-xs text-gray-500 mt-1">Cycle {cycles} of {totalCycles} · {technique.name}</p>
          )}
        </div>

        {/* Progress dots */}
        {isActive && (
          <div className="flex items-center gap-2">
            {Array.from({ length: totalCycles }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i < cycles ? 'bg-accent-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isActive ? (
            <button onClick={start} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent-600 to-primary-600 hover:from-accent-700 hover:to-primary-700 text-white font-bold rounded-2xl shadow-glow-purple transition-all hover:scale-105">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Start Exercise
            </button>
          ) : (
            <button onClick={stop} className="flex items-center gap-2 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-2xl transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              Stop
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Cycles:</span>
            {[2, 3, 4, 5, 6].map(n => (
              <button key={n} onClick={() => !isActive && setTotalCycles(n)} disabled={isActive} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${totalCycles === n ? 'bg-accent-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} ${isActive ? 'opacity-40 cursor-not-allowed' : ''}`}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: '😌', title: 'Reduces Anxiety', desc: 'Activates the parasympathetic nervous system' },
          { icon: '😴', title: 'Improves Sleep', desc: '4-7-8 breathing prepares the body for rest' },
          { icon: '🧠', title: 'Clears the Mind', desc: 'Focused breathing interrupts anxious thought loops' },
        ].map(b => (
          <div key={b.title} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <span className="text-2xl">{b.icon}</span>
            <p className="text-xs font-bold text-gray-800 mt-1.5">{b.title}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Resources Tab ────────────────────────────────────────────────────────────

const ResourcesTab: React.FC = () => (
  <div className="p-5 space-y-5 overflow-y-auto scrollbar-hide">
    {/* Hotlines */}
    <div>
      <h4 className="text-sm font-bold text-gray-900 mb-3">🆘 Crisis Hotlines</h4>
      <div className="space-y-2">
        {[
          { name: '988 Suicide & Crisis Lifeline', detail: 'Call or text 988 · 24/7 · Free & Confidential', color: 'bg-red-50 border-red-200', badge: 'bg-red-600', badgeText: 'CALL 988' },
          { name: 'Crisis Text Line', detail: 'Text HOME to 741741 · 24/7 for any crisis', color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-600', badgeText: 'TEXT 741741' },
          { name: 'SAMHSA Helpline', detail: 'Call 1-800-662-4357 · Substance use & mental health · Free', color: 'bg-primary-50 border-primary-200', badge: 'bg-primary-600', badgeText: 'FREE HELPLINE' },
          { name: 'Veterans Crisis Line', detail: 'Call 988, press 1 · Text 838255 · For veterans & families', color: 'bg-accent-50 border-accent-200', badge: 'bg-accent-600', badgeText: 'FOR VETERANS' },
          { name: 'Trans Lifeline', detail: 'Call 877-565-8860 · Staffed by trans people · Peer support', color: 'bg-purple-50 border-purple-200', badge: 'bg-purple-600', badgeText: 'PEER SUPPORT' },
        ].map(r => (
          <div key={r.name} className={`flex items-center gap-3 p-3 rounded-xl border ${r.color}`}>
            <span className={`text-[10px] font-bold text-white ${r.badge} px-2 py-1 rounded-lg flex-shrink-0`}>{r.badgeText}</span>
            <div>
              <p className="text-xs font-bold text-gray-800">{r.name}</p>
              <p className="text-[11px] text-gray-500">{r.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Self-care tips */}
    <div>
      <h4 className="text-sm font-bold text-gray-900 mb-3">🌱 Daily Self-Care Practices</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: '🚶', title: 'Get Outside Daily', desc: 'Even a 10-minute walk can boost mood and reduce stress hormones.' },
          { icon: '😴', title: 'Prioritize Sleep', desc: 'Aim for 7–9 hours. Good sleep is foundational to mental health.' },
          { icon: '📵', title: 'Digital Detox', desc: 'Take regular breaks from screens, especially before bed.' },
          { icon: '🤝', title: 'Stay Connected', desc: 'Reach out to one person today — connection reduces loneliness.' },
          { icon: '📓', title: 'Journaling', desc: 'Writing thoughts down helps process emotions and gain clarity.' },
          { icon: '🧘', title: 'Mindful Breathing', desc: 'Five minutes of deep breathing can calm the nervous system.' },
        ].map(t => (
          <div key={t.title} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xl flex-shrink-0">{t.icon}</span>
            <div>
              <p className="text-xs font-bold text-gray-800">{t.title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Find a therapist */}
    <div className="bg-gradient-to-br from-accent-600 to-primary-700 rounded-2xl p-5 text-white relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
      <div className="relative">
        <h4 className="text-sm font-bold text-white mb-1">🔍 Find a Therapist</h4>
        <p className="text-xs text-white/70 mb-4 max-w-sm">These free directories can help you find licensed therapists, including low-cost and sliding-scale options.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { name: 'Open Path Collective', detail: 'Directory of lower-cost therapy options (verify details independently)' },
            { name: 'Psychology Today', detail: 'Find therapists filtered by insurance & cost' },
            { name: 'Therapy for Black Girls', detail: 'Therapist directory for Black women & girls' },
            { name: 'LGBTQ+ Affirmative Therapy', detail: 'Welcoming therapists for LGBTQ+ clients' },
          ].map(r => (
            <div key={r.name} className="flex items-start gap-2 p-2.5 bg-white/10 rounded-xl border border-white/15">
              <svg className="w-3.5 h-3.5 text-white/80 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>
              <div>
                <p className="text-[11px] font-bold text-white">{r.name}</p>
                <p className="text-[10px] text-white/60">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/50 mt-3">These are general resources. HealthBridge AI is not affiliated with any external organization. Verify independently.</p>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const MentalWellness: React.FC = () => {
  const [tab, setTab] = useState<TabId>('chat');

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'AI Chat', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'journal', label: 'Mood Journal', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { id: 'breathing', label: 'Breathing', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22a9 9 0 0 1-9-9C3 7.95 7.95 3 13 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9z"/><path d="M9 12c0 1.66 1.34 3 3 3s3-1.34 3-3"/></svg> },
    { id: 'resources', label: 'Resources', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mental Wellness AI</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your personal wellness companion — <span className="text-accent-600 font-medium">demo only, not medical care</span></p>
        </div>
        {/* Streak badge */}
        <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-gradient-to-r from-accent-50 to-primary-50 border border-accent-100 rounded-full px-4 py-2">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-xs font-bold text-accent-700">5-Day Streak</p>
            <p className="text-[10px] text-gray-400">Demo Data</p>
          </div>
        </div>
      </div>

      {/* Crisis banner — always visible */}
      <CrisisBanner />

      {/* Main panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden" style={{ minHeight: 560 }}>
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3.5 text-xs font-semibold transition-all border-b-2 ${tab === t.id ? 'border-accent-500 text-accent-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
            >
              <span className={tab === t.id ? 'text-accent-600' : 'text-gray-400'}>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex flex-col" style={{ minHeight: 500 }}>
          {tab === 'chat' && <ChatTab />}
          {tab === 'journal' && <JournalTab />}
          {tab === 'breathing' && <BreathingTab />}
          {tab === 'resources' && <ResourcesTab />}
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
        <p className="text-xs font-bold text-amber-800 mb-1">⚠ Important Disclaimer</p>
        <p className="text-[11px] text-amber-700 leading-relaxed">
          HealthBridge AI Mental Wellness is a <strong>demonstration application</strong>. The AI chat uses pre-scripted responses and is <strong>not</strong> a licensed therapist, counselor, or medical professional. Do not use this as a substitute for professional mental health care. If you are in crisis, please call or text <strong>988</strong> immediately.
        </p>
      </div>
    </div>
  );
};

export default MentalWellness;
