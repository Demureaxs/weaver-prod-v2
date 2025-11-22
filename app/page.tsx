'use client';
import React, { useState, useEffect, useRef, Component } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Settings,
  Copy,
  RefreshCw,
  Check,
  AlertCircle,
  Sparkles,
  Type,
  List,
  HelpCircle,
  Map,
  Globe,
  Upload,
  ArrowRight,
  Link2,
  Link2Off,
  Edit3,
  X,
  Wand2,
  LogOut,
  User,
  Mail,
  Lock,
  Database,
  Eye,
  Key,
  ExternalLink,
  Images,
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  BarChart2,
  TrendingUp,
  Activity,
  LayoutDashboard,
  CreditCard,
  Layers,
  Clock,
  FileEdit,
} from 'lucide-react';

// --- Safe Firebase Imports & Mocking ---
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithCustomToken,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

const API_KEY = ''; // Injected by environment

// --- PROTOTYPING / MOCK DATA ---
const INITIAL_MOCK_DB = {
  user_alice: {
    uid: 'user_alice',
    email: 'alice@garden-guru.com',
    displayName: 'Alice (Gardener)',
    credits: 50,
    plan: 'Free',
    activeCount: 0,
    sitemap: [
      'https://garden-guru.com/home',
      'https://garden-guru.com/services/landscaping',
      'https://garden-guru.com/services/pruning',
      'https://garden-guru.com/blog/winter-tips',
      'https://garden-guru.com/contact',
    ],
    keywords: ['organic mulch tips', 'winter pruning guide', 'best drought resistant plants'],
    articles: [], // Stores generated content
  },
  user_bob: {
    uid: 'user_bob',
    email: 'bob@tech-stack.io',
    displayName: 'Bob (Dev)',
    credits: 50,
    plan: 'Free',
    activeCount: 0,
    sitemap: [
      'https://tech-stack.io/',
      'https://tech-stack.io/docs/react',
      'https://tech-stack.io/docs/firebase',
      'https://tech-stack.io/pricing',
      'https://tech-stack.io/api-reference',
    ],
    keywords: ['react state management', 'firebase security rules', 'nextjs vs remix'],
    articles: [],
  },
};

// --- Configuration & Initialization ---
let auth = null;
let db = null;
let isDemoMode = true;

const rawAppId = 'default-app-id';
const appId = rawAppId.replace(/[\/]/g, '_');

// --- Error Boundary ---
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App Crash:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-red-50 p-4'>
          <div className='bg-white p-8 rounded-xl shadow-xl max-w-md text-center border border-red-200'>
            <AlertCircle size={48} className='text-red-500 mx-auto mb-4' />
            <h2 className='text-xl font-bold text-gray-800 mb-2'>Something went wrong</h2>
            <p className='text-gray-600 mb-4 text-sm'>The application encountered an error.</p>
            <button onClick={() => window.location.reload()} className='bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700'>
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Helpers ---
const Typewriter = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = 0;
    setDisplayedText('');
    if (!text) return;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        const nextChar = text.charAt(indexRef.current);
        indexRef.current++;
        if (indexRef.current >= text.length) {
          clearInterval(intervalId);
          if (onComplete) {
            setTimeout(onComplete, 0);
          }
          return text;
        }
        return prev + nextChar;
      });
    }, 5);
    return () => clearInterval(intervalId);
  }, [text, onComplete]);
  return <div className="space-y-2 text-left font-sans leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{displayedText}</div>;
};
const formatText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\[.*?\]\(.*?\)|(?<!\*)\*\*(?!\*).*?(?<!\*)\*\*(?!\*)|(?<!\*)\*(?!\*).*?(?<!\*)\*(?!\*)|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match && (match[2].startsWith('http://') || match[2].startsWith('https://'))) {
        return (
          <a
            key={index}
            href={match[2]}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-0.5'
            onClick={(e) => e.stopPropagation()}
          >
            {match[1]}
            <ExternalLink size={10} className='opacity-50' />
          </a>
        );
      }
    }
    if (part.startsWith('**') && part.endsWith('**'))
      return (
        <strong key={index} className='font-bold text-gray-900 dark:text-white'>
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith('*') && part.endsWith('*'))
      return (
        <em key={index} className='italic text-gray-800 dark:text-gray-100'>
          {part.slice(1, -1)}
        </em>
      );
    if (part.startsWith('`') && part.endsWith('`'))
      return (
        <code key={index} className='bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400'>
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
};

const EditableBlock = ({ initialContent, tag, onSave, index, isStreaming, currentApiKey, onDeductCredit }) => {

  const [isEditing, setIsEditing] = useState(false);

  const [content, setContent] = useState(initialContent);

  const [aiPrompt, setAiPrompt] = useState('');

  const [isRefining, setIsRefining] = useState(false);

  const [imageError, setImageError] = useState(false);



  useEffect(() => { setContent(initialContent); }, [initialContent]);

  const handleSave = () => { onSave(index, content); setIsEditing(false); setAiPrompt(''); };

  const handleCancel = () => { setContent(initialContent); setIsEditing(false); setAiPrompt(''); };

  const handleImageError = () => { setImageError(true); };



  const handleAiRefine = async () => {

    if (!aiPrompt.trim()) return;

    

    // Deduct credit for refinement

    if (onDeductCredit && !onDeductCredit(1)) return;



    setIsRefining(true);

    try {

      const activeKey = currentApiKey || API_KEY;

      if (!activeKey) {

          await new Promise(resolve => setTimeout(resolve, 800));

          setContent(`${content} (Refined: ${aiPrompt})`);

      } else {

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeKey}`, {

            method: 'POST', headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({ contents: [{ parts: [{ text: `Refine the following text based on this instruction: "${aiPrompt}". CRITICAL STYLE RULES: 1. Make it sound 100% human. 2. ABSOLUTELY NO em-dashes. 3. NO buzzwords. Return only text. Text to refine: "${content}"` }] }] })

          });

          const data = await response.json();

          const refinedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (refinedText) setContent(refinedText.trim());

      }

      setAiPrompt('');

    } catch (error) { console.error("Refinement failed", error); } finally { setIsRefining(false); }

  };



  const renderDisplay = () => {

    let cleanText = content;

    let className = `p-2 rounded-lg transition-colors border border-transparent relative group ${!isStreaming ? 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 dark:hover:border-indigo-800' : ''}`;

    const handleClick = () => { if (!isStreaming) setIsEditing(true); };



    if (tag === 'h1') return <div onClick={handleClick} className={className}><h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatText(content.replace(/^#\s/, ''))}</h1>{!isStreaming && <Edit3 size={16} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />}</div>;

    if (tag === 'h2') return <div onClick={handleClick} className={className}><h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatText(content.replace(/^##\s/, ''))}</h2>{!isStreaming && <Edit3 size={16} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />}</div>;

    if (tag === 'h3') return <div onClick={handleClick} className={className}><h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{formatText(content.replace(/^###\s/, ''))}</h3>{!isStreaming && <Edit3 size={16} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />}</div>;

    if (tag === 'h4') return <div onClick={handleClick} className={className}><h4 className="text-lg font-semibold text-gray-800 dark:text-gray-300">{formatText(content.replace(/^####\s/, ''))}</h4>{!isStreaming && <Edit3 size={16} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />}</div>;

    if (tag === 'li') return <div onClick={handleClick} className={className}><li className="ml-4 list-disc text-gray-700 dark:text-gray-300">{formatText(content.replace(/^[-*]\s/, ''))}</li>{!isStreaming && <Edit3 size={16} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />}</div>;

    if (tag === 'img') {

       if (imageError) return null;

       const alt = content.match(/!\[(.*?)\]/)?.[1] || 'Image';

       const src = content.match(/\((.*?)\)/)?.[1];

       return <img src={src} alt={alt} className="w-full h-auto rounded-lg shadow-md my-4 object-cover max-h-96" onError={handleImageError} />;

    }

    if (tag === 'spacer') return <div className="h-2"></div>;

    return <div onClick={handleClick} className={className}><p className="text-gray-600 dark:text-gray-300 leading-relaxed">{formatText(content)}</p>{!isStreaming && <Edit3 size={14} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />}</div>;

  };



  if (isEditing) {

    return (

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-indigo-500 p-4 space-y-3 animate-fade-in my-4">

        <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Editing Block</span><div className="flex gap-2"><button onClick={handleCancel} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"><X size={18} /></button><button onClick={handleSave} className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded text-indigo-600"><Check size={18} /></button></div></div>

        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-mono focus:ring-0 focus:border-indigo-500 outline-none min-h-[100px] text-gray-800 dark:text-gray-200" />

        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 flex flex-col sm:flex-row gap-2 items-center">

             <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm"><Sparkles size={16} className="text-indigo-500" /></div>

             <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="AI Prompt: 'Make it funnier' (Costs 1 Credit)..." className="flex-grow bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 text-gray-800 dark:text-gray-200 min-w-0 w-full sm:w-auto" onKeyDown={(e) => e.key === 'Enter' && handleAiRefine()} />

             <button onClick={handleAiRefine} disabled={isRefining || !aiPrompt.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">{isRefining ? <RefreshCw size={16} className="animate-spin" /> : <Wand2 size={16} />}</button>

        </div>

      </div>

    );

  }

  return renderDisplay();

};

const SimpleMarkdown = ({ content, onContentChange, isStreaming = false, currentApiKey, onDeductCredit }) => {
  if (!content) return <div className='text-gray-400 italic'>No content generated yet...</div>;
  const lines = content.split('\n');
  const handleBlockSave = (index, newContent) => {
    const newLines = [...lines];
    newLines[index] = newContent;
    onContentChange(newLines.join('\n'));
  };
  return (
    <div className='space-y-2 text-left font-sans leading-relaxed text-gray-800 dark:text-gray-200'>
      {lines.map((line, index) => {
        let tag = 'p';
        if (line.startsWith('# ')) tag = 'h1';
        else if (line.startsWith('## ')) tag = 'h2';
        else if (line.startsWith('### ')) tag = 'h3';
        else if (line.startsWith('#### ')) tag = 'h4';
        else if (line.startsWith('- ') || line.startsWith('* ')) tag = 'li';
        else if (line.startsWith('![')) tag = 'img';
        else if (line.trim() === '') tag = 'spacer';
        return (
          <EditableBlock
            key={index}
            index={index}
            initialContent={line}
            tag={tag}
            onSave={handleBlockSave}
            isStreaming={isStreaming}
            currentApiKey={currentApiKey}
            onDeductCredit={onDeductCredit}
          />
        );
      })}
    </div>
  );
};

const AuthScreen = ({ onLogin, mockUsers, switchMockUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleMockAuth = (e) => {
    e?.preventDefault();
    onLogin(mockUsers['user_alice']);
  };
  const handleGoogleLogin = async () => {
    if (isDemoMode || !auth) {
      onLogin(mockUsers['user_bob']);
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (isDemoMode || !auth) {
      handleMockAuth(e);
      return;
    }
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4'>
      <div className='bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700'>
        <div className='text-center mb-8'>
          <div className='bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg'>
            <Sparkles size={32} />
          </div>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Welcome to BlogGenie</h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>AI-Powered Content Creation</p>
          {isDemoMode && (
            <span className='inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full border border-yellow-200'>
              Prototyping / Demo Mode
            </span>
          )}
        </div>
        {isDemoMode && (
          <div className='mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800'>
            <h3 className='text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-3 tracking-wider'>Quick Prototyping Login</h3>
            <div className='grid grid-cols-2 gap-3'>
              <button
                onClick={() => onLogin(mockUsers['user_alice'])}
                className='p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-gray-100 dark:border-gray-700'
              >
                <div className='font-bold text-sm text-gray-800 dark:text-gray-200'>Alice</div>
                <div className='text-xs text-gray-500'>Gardener</div>
              </button>
              <button
                onClick={() => onLogin(mockUsers['user_bob'])}
                className='p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-gray-100 dark:border-gray-700'
              >
                <div className='font-bold text-sm text-gray-800 dark:text-gray-200'>Bob</div>
                <div className='text-xs text-gray-500'>Developer</div>
              </button>
            </div>
          </div>
        )}
        {error && (
          <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2'>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        <form onSubmit={handleEmailAuth} className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Email</label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none'
                required
              />
            </div>
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Password</label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' size={18} />
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none'
                required
              />
            </div>
          </div>
          <button type='submit' className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors'>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <div className='my-6 flex items-center gap-4'>
          <div className='h-px bg-gray-200 dark:bg-gray-700 flex-1'></div>
          <span className='text-xs text-gray-400 font-medium'>OR</span>
          <div className='h-px bg-gray-200 dark:bg-gray-700 flex-1'></div>
        </div>
        <button
          onClick={handleGoogleLogin}
          className='w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600'
        >
          <Globe size={18} />
          Continue with Google
        </button>
        <p className='mt-6 text-center text-sm text-gray-500'>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setIsLogin(!isLogin)} className='text-indigo-600 hover:underline font-medium'>
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Helper for difficulty color
const getDifficultyColor = (diff) => {
  if (diff < 40) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700';
  if (diff < 70) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-700';
};

// --- NEW: Dashboard Component ---
const Dashboard = ({ user }) => {
  return (
    <div className='animate-fade-in space-y-6'>
      <h2 className='text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6'>Dashboard</h2>

      {/* Metrics Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Articles Generated */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Articles Generated</p>
            {/* Shows actual count of articles from the array */}
            <h3 className='text-3xl font-bold text-indigo-600 dark:text-indigo-400'>{user.articles ? user.articles.length : 0}</h3>
          </div>
          <div className='bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-500'>
            <FileText size={24} />
          </div>
        </div>

        {/* Active Drafts */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Active Drafts</p>
            <h3 className='text-3xl font-bold text-purple-600 dark:text-purple-400'>{user.activeCount || 0}</h3>
          </div>
          <div className='bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl text-purple-500'>
            <Edit3 size={24} />
          </div>
        </div>

        {/* Credits Remaining */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Credits Remaining</p>
            <h3 className={`text-3xl font-bold ${user.credits > 10 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {user.credits}
            </h3>
          </div>
          <div className='bg-green-50 dark:bg-green-900/30 p-3 rounded-xl text-green-500'>
            <CreditCard size={24} />
          </div>
        </div>

        {/* Current Plan */}
        <div className='bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex items-center justify-between'>
          <div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Current Plan</p>
            <h3 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>{user.plan}</h3>
          </div>
          <div className='bg-gray-100 dark:bg-gray-700/50 p-3 rounded-xl text-gray-600 dark:text-gray-300'>
            <Layers size={24} />
          </div>
        </div>
      </div>

      {/* Quick Action / Upgrade Banner */}
      <div className='bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg'>
        <div className='flex justify-between items-center'>
          <div>
            <h3 className='font-bold text-lg'>Running low on credits?</h3>
            <p className='text-indigo-100 text-sm opacity-90'>Upgrade your plan to unlock unlimited generation.</p>
          </div>
          <button className='bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors'>
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Recent Drafts / Articles List */}
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden'>
        <div className='p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/30'>
          <FileEdit className='text-indigo-500' size={20} />
          <h3 className='font-bold text-gray-700 dark:text-gray-200'>Recent Drafts</h3>
        </div>
        <div className='divide-y divide-gray-100 dark:divide-gray-700'>
          {user.articles && user.articles.length > 0 ? (
            user.articles.map((article, idx) => (
<button key={article.id} className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group flex justify-between items-center">
                <div>
                  <h4 className='font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 transition-colors'>{article.title}</h4>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs text-gray-400 flex items-center gap-1'>
                      <Clock size={10} /> {new Date(article.date).toLocaleDateString()}
                    </span>
                    <span className='text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-wide'>
                      {article.status || 'Draft'}
                    </span>
                  </div>
                </div>
                <div className='text-gray-300 group-hover:text-indigo-400'>
                  <ArrowRight size={18} />
                </div>
              </button>
            ))
          ) : (
            <div className='p-8 text-center text-gray-400'>
              <p>No articles generated yet.</p>
              <p className='text-xs mt-1'>Go to the Generator tab to create your first post!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [mockUsers, setMockUsers] = useState(INITIAL_MOCK_DB);

  const [activeTool, setActiveTool] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('editor');
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const [seedKeyword, setSeedKeyword] = useState('');
  const [keywordResults, setKeywordResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isKeywordDropdownOpen, setIsKeywordDropdownOpen] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [wordCount, setWordCount] = useState(500);
  const [sectionCount, setSectionCount] = useState(3);
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeImage, setIncludeImage] = useState(true);
  const [bodyImageCount, setBodyImageCount] = useState(1);
  const [userApiKey, setUserApiKey] = useState('');

  const [sitemapInputType, setSitemapInputType] = useState('url');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [sitemapText, setSitemapText] = useState('');
  const [discoveredUrls, setDiscoveredUrls] = useState([]);
  const [sitemapStatus, setSitemapStatus] = useState('idle');
  const [sitemapError, setSitemapError] = useState('');
  const [omitBaseUrl, setOmitBaseUrl] = useState(false);
  const [savedSitemaps, setSavedSitemaps] = useState([]);
  const [savedKeywords, setSavedKeywords] = useState([]);

useEffect(() => {
    if (isDemoMode || !auth) { setIsLoadingAuth(false); return; }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); setIsLoadingAuth(false); });
    return () => unsubscribe();
  }, [isDemoMode, auth]);

  useEffect(() => {

      if (!user) return;

      if (isDemoMode || !db) {

        const currentUserData = mockUsers[user.uid];

        if (currentUserData) {

          // SYNC MOCK DB STATE TO LOCAL STATE

          setSavedSitemaps(currentUserData.sitemap || []);

          setSavedKeywords(currentUserData.keywords || []);

          if (discoveredUrls.length === 0 && currentUserData.sitemap) {

              setDiscoveredUrls(currentUserData.sitemap);

              setSitemapStatus('parsed');

          }

        }

        return;

      }

      // Real Firestore listeners would go here 

      const sitemapRef = doc(db, 'artifacts', appId, 'users', user.uid, 'sitemap_data', 'main');

      const kwRef = doc(db, 'artifacts', appId, 'users', user.uid, 'keyword_data', 'main');

      

      const unsubSitemap = onSnapshot(sitemapRef, (docSnap) => {

        if (docSnap.exists()) {

          setSavedSitemaps(docSnap.data().urls || []);

        }

      });

      

      const unsubKw = onSnapshot(kwRef, (docSnap) => {

          if (docSnap.exists()) {

              setSavedKeywords(docSnap.data().keywords || []);

          }

      });

  

      return () => { unsubSitemap(); unsubKw(); };

    }, [user?.uid, mockUsers, isDemoMode, db, discoveredUrls, appId]);

  const saveSitemapToProfile = async (urls) => {
    if (!user) return;
    if (isDemoMode || !db) {
      setMockUsers((prev) => ({ ...prev, [user.uid]: { ...prev[user.uid], sitemap: urls } }));
      setSavedSitemaps(urls);
      return;
    }
    try {
      const sitemapRef = doc(db, 'artifacts', appId, 'users', user.uid, 'sitemap_data', 'main');
      await setDoc(sitemapRef, { urls: urls, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error('Failed to save sitemap', err);
    }
  };

  const saveArticleToProfile = async (article) => {
    if (!user) return;

    // Update Mock
    if (isDemoMode || !db) {
      const updatedArticles = [article, ...(user.articles || [])];
      setMockUsers((prev) => ({
        ...prev,
        [user.uid]: {
          ...prev[user.uid],
          articles: updatedArticles,
        },
      }));
      // Immediate local update so Dashboard reflects it instantly without waiting for sync
      setUser((prev) => ({ ...prev, articles: updatedArticles }));
      return;
    }

    // Update Real Firestore (This part is simplified, ideally would be a subcollection)
    try {
      // Note: Storing large markdown in a single user doc array isn't scalable,
      // but fits the constraints of this single-file prototype.
      // Ideally: collection(db, 'articles')...
    } catch (e) { }
  };

  const toggleKeyword = async (kw) => {
    if (!user) return;
    const term = typeof kw === 'string' ? kw : kw.keyword;
    let newKeywords = savedKeywords.includes(term) ? savedKeywords.filter((k) => k !== term) : [...new Set([...savedKeywords, term])];

    if (isDemoMode || !db) {
      setMockUsers((prev) => ({ ...prev, [user.uid]: { ...prev[user.uid], keywords: newKeywords } }));
      setSavedKeywords(newKeywords);
      return;
    }

    try {
      const kwRef = doc(db, 'artifacts', appId, 'users', user.uid, 'keyword_data', 'main');
      await setDoc(kwRef, { keywords: newKeywords, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error('Failed to update keywords', err);
    }
  };

  const switchMockUser = (mockUid) => {
    const newUser = mockUsers[mockUid];
    setUser(newUser);
    setDiscoveredUrls(newUser.sitemap || []);
    setSitemapStatus(newUser.sitemap ? 'parsed' : 'idle');
    setStatus('idle');
    setGeneratedContent('');
    setKeywordResults(null);
    setSeedKeyword('');
    setActiveTool('dashboard');
  };

  const checkAndDeductCredits = (cost) => {
    if (user.credits < cost) {
      alert(`Not enough credits! You need ${cost} but have ${user.credits}. Upgrade to continue.`);
      return false;
    }

    if (isDemoMode || !db) {
      setMockUsers((prev) => ({
        ...prev,
        [user.uid]: {
          ...prev[user.uid],
          credits: prev[user.uid].credits - cost,
          generatedCount: (prev[user.uid].generatedCount || 0) + 1,
        },
      }));
      return true;
    }
    // For real DB, we'd transactionally update here. Returning true for prototype flow.
    return true;
  };

  const handleKeywordSearch = async () => {
    if (!seedKeyword.trim()) return;
    setIsSearching(true);
    setKeywordResults(null);
    const activeKey = userApiKey || API_KEY;

    let suggestions = [];
    const augmentData = (term) => ({ keyword: term, volume: Math.floor(Math.random() * 10000) + 50, difficulty: Math.floor(Math.random() * 100) });

    try {
      const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(seedKeyword)}`);
      if (!res.ok) throw new Error('CORS');
      const data = await res.json();
      suggestions = data[1].map(augmentData);
    } catch (err) {
      if (activeKey) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Generate 20 popular Google search autocomplete suggestions for the keyword "${seedKeyword}". Return ONLY a JSON array of strings. Example: ["keyword one", "keyword two"]`,
                      },
                    ],
                  },
                ],
              }),
            }
          );
          const aiData = await response.json();
          const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          const cleanText = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
          suggestions = JSON.parse(cleanText).map(augmentData);
        } catch (aiErr) {
          console.error(aiErr);
        }
      }
      if (!suggestions.length) {
        await new Promise((r) => setTimeout(r, 800));
        suggestions = [`${seedKeyword} guide`, `${seedKeyword} tips`, `best ${seedKeyword}`, `how to ${seedKeyword}`].map(augmentData);
      }
    }

    const categorized = { questions: [], prepositions: [], general: [] };
    const qWords = ['who', 'what', 'where', 'when', 'why', 'how'];
    const pWords = ['for', 'with', 'near', 'vs'];

    suggestions.forEach((item) => {
      const lower = item.keyword.toLowerCase();
      if (qWords.some((q) => lower.startsWith(q + ' '))) categorized.questions.push(item);
      else if (pWords.some((p) => lower.includes(' ' + p + ' '))) categorized.prepositions.push(item);
      else categorized.general.push(item);
    });
    setKeywordResults(categorized);
    setIsSearching(false);
  };

  const draftFromUrl = (url) => {
    // Extract a topic from the URL slug
    try {
      const urlObj = new URL(url);
      const slug = urlObj.pathname.split('/').pop() || '';
      // cleanup slug: remove extension, replace dashes/underscores with spaces, capitalize
      const topic = slug.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setKeyword(topic);
      setActiveTool('generator');
      setActiveTab('editor');
    } catch (e) {
      // Fallback if URL parsing fails
      setKeyword(url);
      setActiveTool('generator');
    }
  };

  const generateBlog = async () => {
    if (!keyword.trim()) {
      setStatus('error');
      setStatusMessage('Please enter a keyword first.');
      return;
    }

    if (!checkAndDeductCredits(10)) return;

    setStatus('generating');
    setGeneratedContent('');
    setIsStreaming(false);
    setGeneratedImage(null);
    setActiveTab('preview');
    setStatusMessage('Initializing AI agents...');
    const activeKey = userApiKey || API_KEY;

    try {
      setStatusMessage(`Drafting ${wordCount} words on "${keyword}"...`);
      let internalLinksContext =
        savedSitemaps.length > 0
          ? `SEO & LINKING (CRITICAL): INTERNAL LINKS: Naturally integrate 3-5 links from: ${savedSitemaps
              .slice(0, 25)
              .join(', ')}. EXTERNAL LINKS: Include 2-3 high-authority external links.`
          : `SEO & LINKING: EXTERNAL LINKS: Include 2-3 high-authority external links.`;

      let markdown = '';
      try {
        if (!activeKey) throw new Error('No API Key');
        const textResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `
                Write a blog post about "${keyword}". Word count: ~${wordCount}. Sections: ${sectionCount}. ${includeFaq ? 'Include FAQ.' : ''}
                ${internalLinksContext}
                IMAGES: Include ${bodyImageCount} additional images within body text using tag: [IMAGE_PROMPT: description]
                STYLE GUIDELINES:
                1. TONE: Conversational, human, authentic.
                2. NO em-dashes (—).
                3. NO buzzwords (leverage, unleash, game-changer).
                4. EXTERNAL LINKS: MUST be real, clickable URLs (e.g., [Wikipedia](https://wikipedia.org/wiki/...)), NEVER placeholders like [Link 1].
                5. FORMAT: STRICT Markdown (# H1, ## H2).
              `,
                    },
                  ],
                },
              ],
            }),
          }
        );
        if (!textResponse.ok) throw new Error('API call failed');
        const textData = await textResponse.json();
        let rawMarkdown = textData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawMarkdown) throw new Error('No content');
        markdown = rawMarkdown.replace(/^H(\d):\s*/gm, (match, level) => '#'.repeat(parseInt(level)) + ' ');
      } catch (apiError) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        markdown = `# ${keyword} (Demo Mode)\n\n*Real generation failed.* \n\n## Introduction\nWelcome to your blog post about ${keyword}. \n\n[IMAGE_PROMPT: A futuristic robot writing a blog post]\n\n## Main Section\nContent goes here.`;
      }

      if (includeImage && !generatedImage) {
        setGeneratedImage(`https://placehold.co/600x400/indigo/white?text=${encodeURIComponent(keyword)}`);
      }

      markdown = markdown.replace(/\[IMAGE_PROMPT:\s*(.*?)\]/g, (match, prompt) => {
        return `![${prompt}](https://placehold.co/600x400/orange/white?text=${encodeURIComponent(prompt.substring(0, 20))})`;
      });

      setGeneratedContent(markdown);

      // Save the new article to profile
      saveArticleToProfile({
        id: Date.now().toString(),
        title: keyword,
        date: new Date().toISOString(),
        status: 'Draft',
        snippet: markdown.substring(0, 100) + '...',
      });

      setStatus('success');
      setStatusMessage('Content ready!');
      setIsStreaming(true);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setStatusMessage('Failed.');
    }
  };

const handleRefineCreditDeduction = (cost) => {
    return checkAndDeductCredits(cost);
  };

  const handleSitemapFetch = async () => {
    setSitemapStatus('loading');
    setSitemapError('');
    setDiscoveredUrls([]);

    try {
      let sitemapTextContent = sitemapText;
      if (sitemapInputType === 'url' && sitemapUrl) {
        try {
          const response = await fetch(sitemapUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
          }
          sitemapTextContent = await response.text();
        } catch (e) {
          setSitemapError(`Failed to fetch from URL. If this is a local file, please use the text input instead. Error: ${e.message}`);
          setSitemapStatus('idle');
          return;
        }
      }

      if (!sitemapTextContent) {
        setSitemapError('Please provide a sitemap URL or text.');
        setSitemapStatus('idle');
        return;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(sitemapTextContent, 'text/xml');
      const urls = Array.from(xmlDoc.getElementsByTagName('loc')).map((loc) => loc.textContent);

      if (urls.length === 0) {
        setSitemapError('No URLs found in the sitemap.');
        setSitemapStatus('idle');
        return;
      }

      setDiscoveredUrls(urls);
      saveSitemapToProfile(urls);
      setSitemapStatus('parsed');
    } catch (e) {
      setSitemapError(`Failed to parse sitemap. Please check the format. Error: ${e.message}`);
      setSitemapStatus('idle');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  if (isLoadingAuth)
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600'></div>
      </div>
    );
  if (!user) return <AuthScreen onLogin={(userData) => setUser(userData)} mockUsers={mockUsers} />;

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col'>
      <header className='sticky top-0 z-10 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-4 shadow-sm'>
        <div className='max-w-3xl mx-auto flex justify-between items-center'>
          <div className='flex items-center gap-2 cursor-pointer' onClick={() => setActiveTool('dashboard')}>
            <div className='bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white'>
              <Sparkles size={20} />
            </div>
            <h1 className='text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400'>
              BlogGenie
            </h1>
          </div>
          <div className='flex items-center gap-4'>
            {user && (
              <div className='flex items-center gap-2'>
                {isDemoMode && (
                  <div className='relative group'>
                    <button className='hidden md:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors'>
                      <User size={14} className='text-indigo-500' />
                      <span className='text-xs font-medium text-indigo-700 dark:text-indigo-300 max-w-[120px] truncate'>
                        {user.displayName || user.email}
                      </span>
                    </button>
                    <div className='absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 hidden group-hover:block z-50'>
                      <div className='text-xs font-bold text-gray-400 px-2 py-1 uppercase'>Switch User</div>
                      {Object.values(mockUsers).map((u) => (
                        <button
                          key={u.uid}
                          onClick={() => switchMockUser(u.uid)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
                            user.uid === u.uid
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${user.uid === u.uid ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                          {u.displayName.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => {
                if (auth) signOut(auth);
                setUser(null);
              }}
              className='p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors'
              title='Sign Out'
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className='flex-grow max-w-3xl w-full mx-auto p-4 pb-24'>
        {activeTool === 'dashboard' && <Dashboard user={user} />}

        {activeTool === 'keywords' && (
          <div className='animate-fade-in space-y-6'>
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-6'>
              <div className='flex items-center gap-2 mb-6'>
                <Search className='text-indigo-500' size={24} />
                <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>Keyword Research</h2>
              </div>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={seedKeyword}
                  onChange={(e) => setSeedKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
                  placeholder='Enter a seed keyword...'
                  className='flex-grow bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500'
                />
                <button
                  onClick={handleKeywordSearch}
                  disabled={isSearching || !seedKeyword.trim()}
                  className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-bold disabled:opacity-50 transition-colors'
                >
                  {isSearching ? <RefreshCw size={20} className='animate-spin' /> : 'Search'}
                </button>
              </div>
            </div>
            {keywordResults && (
              <div className='grid gap-6'>
                {['questions', 'prepositions', 'general'].map((type) => {
                  if (keywordResults[type].length === 0) return null;
                  return (
                    <div
                      key={type}
                      className='bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden'
                    >
                      <div className='p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700'>
                        <h3 className='font-bold capitalize text-gray-700 dark:text-gray-300'>{type}</h3>
                        <span className='text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500'>{keywordResults[type].length}</span>
                      </div>
                      <div className='divide-y divide-gray-100 dark:divide-gray-700'>
                        <div className='hidden sm:flex p-2 text-xs text-gray-400 font-semibold uppercase tracking-wider'>
                          <div className='flex-grow pl-2'>Keyword</div>
                          <div className='w-20 text-center'>Volume</div>
                          <div className='w-20 text-center'>Diff.</div>
                          <div className='w-10'></div>
                        </div>
                        {keywordResults[type].map((item, i) => {
                          const isSaved = savedKeywords.includes(item.keyword);
                          return (
<div key={item.keyword} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group gap-2 sm:gap-0">
                              <span className='text-sm font-medium text-gray-700 dark:text-gray-200 flex-grow truncate'>{item.keyword}</span>
                              <div className='flex items-center justify-between sm:justify-end sm:gap-4 w-full sm:w-auto'>
                                <div className='flex gap-3 sm:gap-4 text-xs'>
                                  <div className='flex items-center gap-1 text-gray-500 w-16 justify-end'>
                                    <BarChart2 size={12} />
                                    {item.volume >= 1000 ? (item.volume / 1000).toFixed(1) + 'k' : item.volume}
                                  </div>
                                  <div
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full w-16 justify-center border ${getDifficultyColor(
                                      item.difficulty
                                    )}`}
                                  >
                                    <TrendingUp size={10} />
                                    {item.difficulty}
                                  </div>
                                </div>
                                <button
                                  onClick={() => toggleKeyword(item.keyword)}
                                  className={`p-1.5 rounded-lg transition-all ml-2 ${
                                    isSaved ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400 hover:text-indigo-600'
                                  }`}
                                >
                                  {isSaved ? <Trash2 size={16} /> : <Plus size={16} />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTool === 'generator' && (
          <div className='animate-fade-in'>
            <div className={`${activeTab === 'editor' ? 'block' : 'hidden'}`}>
              <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden'>
                <div className='p-6 space-y-8'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1'>Topic</label>

                    {/* Click-Based Combobox for Topic Selection */}
                    <div className='relative'>
                      <input
                        type='text'
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder='e.g., Sustainable Gardening'
                        className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 pl-5 pr-10 text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all'
                      />

                      {/* Dropdown Trigger if saved keywords exist */}
                      {savedKeywords.length > 0 && (
                        <div className='absolute right-2 top-1/2 -translate-y-1/2'>
                          <button
                            onClick={() => setIsKeywordDropdownOpen(!isKeywordDropdownOpen)}
                            className='p-2 text-gray-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-indigo-50'
                            title='Select saved keyword'
                          >
                            {isKeywordDropdownOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>

                          {/* Click-based Dropdown */}
                          {isKeywordDropdownOpen && (
                            <>
                              <div className='fixed inset-0 z-40' onClick={() => setIsKeywordDropdownOpen(false)}></div>
                              <div className='absolute right-0 top-full mt-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-1 z-50'>
                                <div className='text-xs font-bold text-gray-400 px-3 py-2 uppercase border-b border-gray-100 dark:border-gray-700'>
                                  Saved Keywords
                                </div>
                                {savedKeywords.map((kw, i) => (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      setKeyword(kw);
                                      setIsKeywordDropdownOpen(false);
                                    }}
                                    className='w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 truncate transition-colors'
                                  >
                                    {kw}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div className='space-y-4'>
                      <div className='flex justify-between items-center'>
                        <label className='flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300'>
                          <Type size={16} /> Word Count
                        </label>
                        <span className='bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-md'>
                          ~{wordCount}
                        </span>
                      </div>
                      <input
                        type='range'
                        min='300'
                        max='2000'
                        step='100'
                        value={wordCount}
                        onChange={(e) => setWordCount(Number(e.target.value))}
                        className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600'
                      />
                    </div>
                    <div className='space-y-4'>
                      <div className='flex justify-between items-center'>
                        <label className='flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300'>
                          <List size={16} /> Sections
                        </label>
                        <span className='bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 text-xs font-bold px-2 py-1 rounded-md'>
                          {sectionCount}
                        </span>
                      </div>
                      <input
                        type='range'
                        min='2'
                        max='8'
                        step='1'
                        value={sectionCount}
                        onChange={(e) => setSectionCount(Number(e.target.value))}
                        className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600'
                      />
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <label className='flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300'>
                        <Images size={16} /> Body Images
                      </label>
                      <span className='bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 text-xs font-bold px-2 py-1 rounded-md'>
                        {bodyImageCount}
                      </span>
                    </div>
                    <input
                      type='range'
                      min='0'
                      max='3'
                      step='1'
                      value={bodyImageCount}
                      onChange={(e) => setBodyImageCount(Number(e.target.value))}
                      className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-600'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4 pt-2'>
                    <button
                      onClick={() => setIncludeFaq(!includeFaq)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        includeFaq
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <HelpCircle size={24} className='mb-2' />
                      <span className='text-sm font-semibold'>Include FAQ</span>
                    </button>
                    <button
                      onClick={() => setIncludeImage(!includeImage)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                        includeImage
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                          : 'border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <ImageIcon size={24} className='mb-2' />
                      <span className='text-sm font-semibold'>AI Header Image</span>
                    </button>
                  </div>
                  {savedSitemaps.length > 0 && (
                    <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900 flex items-start gap-3'>
                      <Link2 size={18} className='text-green-600 mt-0.5' />
                      <div>
                        <h4 className='text-sm font-bold text-green-800 dark:text-green-300'>Internal Linking Active</h4>
                        <p className='text-xs text-green-600 dark:text-green-400 mt-1'>Found {savedSitemaps.length} pages.</p>
                      </div>
                    </div>
                  )}

                  {/* API Key Input */}
                  <div className='pt-4 border-t border-gray-100 dark:border-gray-700'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Key size={14} className='text-gray-400' />
                      <span className='text-xs font-bold text-gray-500 uppercase'>API Settings (Optional)</span>
                    </div>
                    <input
                      type='password'
                      value={userApiKey}
                      onChange={(e) => setUserApiKey(e.target.value)}
                      placeholder='Paste Google Gemini API Key here (starts with AIza...)'
                      className='w-full text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors'
                    />
                  </div>

                  <button
                    onClick={generateBlog}
                    disabled={!keyword.trim()}
                    className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2'
                  >
                    <Sparkles size={20} /> Generate Blog Post (10 Credits)
                  </button>
                  {status === 'success' && (
                    <button
                      onClick={() => setActiveTab('preview')}
                      className='w-full bg-white dark:bg-gray-700 border-2 border-indigo-100 dark:border-gray-600 text-indigo-600 dark:text-indigo-300 font-bold py-4 rounded-xl shadow-sm hover:bg-indigo-50 dark:hover:bg-gray-600 flex items-center justify-center gap-2 mt-3 transition-colors'
                    >
                      <Eye size={20} /> View Current Preview
                    </button>
                  )}
                </div>
              </div>
            </div>

           
            <div className={`${activeTab === 'preview' ? 'block' : 'hidden'}`}>
              {status === 'generating' && (
                <div className='flex flex-col items-center justify-center py-20 space-y-6'>
                  <div className='relative w-24 h-24'>
                    <div className='absolute top-0 left-0 w-full h-full border-4 border-indigo-200 dark:border-gray-700 rounded-full animate-pulse'></div>
                    <div className='absolute top-0 left-0 w-full h-full border-t-4 border-indigo-600 rounded-full animate-spin'></div>
                  </div>
                  <p className='text-gray-500 dark:text-gray-400 text-sm'>{statusMessage}</p>
                </div>
              )}
              {status === 'success' && (
                <div className='space-y-6'>
                  <div className='flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700'>
                    <button
                      onClick={() => setActiveTab('editor')}
                      className='flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                    >
                      <Settings size={16} /> Edit Config
                    </button>
                    <button
                      id='copy-btn'
                      onClick={copyToClipboard}
                      className='flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors'
                    >
                      <Copy size={16} /> Copy Markdown
                    </button>
                  </div>
                  <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 min-h-[60vh]'>
                    {isStreaming ? (
                      <Typewriter text={generatedContent} onComplete={() => setIsStreaming(false)} />
                    ) : (
                      <SimpleMarkdown
                        content={generatedContent}
                        onContentChange={setGeneratedContent}
                        currentApiKey={userApiKey}
                        onDeductCredit={handleRefineCreditDeduction}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTool === 'sitemap' && (
          <div className='animate-fade-in space-y-6'>
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-6'>
              <div className='flex items-center gap-2 mb-6'>
                <Map className='text-pink-500' size={24} />
                <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100'>Sitemap Manager</h2>
              </div>
              <div className='flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4'>
                <button
                  onClick={() => setSitemapInputType('url')}
                  className={`pb-2 text-sm font-medium transition-colors ${
                    sitemapInputType === 'url' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'
                  }`}
                >
                  URL Link
                </button>
                <button
                  onClick={() => setSitemapInputType('text')}
                  className={`pb-2 text-sm font-medium transition-colors ${
                    sitemapInputType === 'text' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'
                  }`}
                >
                  File / Text
                </button>
              </div>
              {sitemapInputType === 'url' ? (
                <div className='space-y-4'>
                  <div className='relative'>
                    <Globe className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
                    <input
                      type='text'
                      value={sitemapUrl}
                      onChange={(e) => setSitemapUrl(e.target.value)}
                      placeholder='https://example.com/sitemap.xml'
                      className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-12 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none'
                    />
                  </div>
                  <p className='text-xs text-gray-500'>Fetch may fail due to CORS. Use File/Text if this happens.</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors relative'>
                    <input
                      type='file'
                      accept='.xml'
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setSitemapText(ev.target.result);
                          setSitemapInputType('text');
                        };
                        reader.readAsText(file);
                      }}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                    />
                    <Upload className='mx-auto text-gray-400 mb-2' size={24} />
                    <span className='text-sm text-gray-500'>Click to upload .xml file</span>
                  </div>
                  <div className='relative'>
                    <textarea
                      value={sitemapText}
                      onChange={(e) => setSitemapText(e.target.value)}
                      placeholder='<urlset>...</urlset>'
                      className='w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 h-32 font-mono text-xs focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none'
                    />
                  </div>
                </div>
              )}
              <button
                onClick={handleSitemapFetch}
                disabled={sitemapStatus === 'loading'}
                className='w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2'
              >
                {sitemapStatus === 'loading' ? 'Processing...' : 'Collect & Save Pages'}
              </button>
              {sitemapError && (
                <div className='mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg flex gap-2 items-start'>
                  <AlertCircle size={16} className='mt-0.5 flex-shrink-0' />
                  {sitemapError}
                </div>
              )}
            </div>
            {sitemapStatus === 'parsed' && (
              <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden'>
                <div className='p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                  <h3 className='font-semibold text-gray-700 dark:text-gray-200'>Found Pages ({discoveredUrls.length})</h3>
                  <button
                    onClick={() => setOmitBaseUrl(!omitBaseUrl)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      omitBaseUrl
                        ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent'
                    }`}
                  >
                    {omitBaseUrl ? <Link2Off size={14} /> : <Link2 size={14} />} Omit Base URL
                  </button>
                </div>
                <div className='max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700'>
                  {discoveredUrls.map((url, idx) => {
                    const displayUrl = omitBaseUrl
                      ? (() => {
                          try {
                            return new URL(url).pathname;
                          } catch (e) {
                            return url;
                          }
                        })()
                      : url;
                    return (
                      <div key={url} className='p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group'>
                        <div className='flex justify-between items-start gap-4'>
                          <div className='min-w-0 flex-grow'>
                            <span className='text-xs text-gray-400 truncate block max-w-[200px] sm:max-w-xs'>{displayUrl}</span>
                            <p className='text-sm font-medium text-gray-800 dark:text-gray-200 truncate'>
                              {url.split('/').pop().replace(/-/g, ' ').replace('.html', '') || 'Home'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <div className='fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 shadow-lg z-20'>
        <div className='flex justify-around max-w-lg mx-auto'>
          <button
            onClick={() => setActiveTool('dashboard')}
            className={`flex-1 p-2 rounded-xl flex flex-col items-center transition-colors ${
              activeTool === 'dashboard'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LayoutDashboard size={24} />
            <span className='text-xs mt-1 font-medium'>Home</span>
          </button>
          <button
            onClick={() => setActiveTool('generator')}
            className={`flex-1 p-2 rounded-xl flex flex-col items-center transition-colors ${
              activeTool === 'generator'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sparkles size={24} />
            <span className='text-xs mt-1 font-medium'>Generator</span>
          </button>
          <button
            onClick={() => setActiveTool('keywords')}
            className={`flex-1 p-2 rounded-xl flex flex-col items-center transition-colors ${
              activeTool === 'keywords'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Search size={24} />
            <span className='text-xs mt-1 font-medium'>Keywords</span>
          </button>
          <button
            onClick={() => setActiveTool('sitemap')}
            className={`flex-1 p-2 rounded-xl flex flex-col items-center transition-colors ${
              activeTool === 'sitemap' ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Map size={24} />
            <span className='text-xs mt-1 font-medium'>Sitemap</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
