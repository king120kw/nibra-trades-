
import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Mic, Plus, X, Flag, Bitcoin, Briefcase, Globe, BarChart3, Clock, TrendingUp, Settings as SettingsIcon, Search } from 'lucide-react';
import { AIReasoningResponse, ChatMessage, SafetyStep, UserProfile, WatchlistItem, WatchlistFlag, AssetType } from '../types';
import { generateStrategyReasoning } from '../services/geminiService';

interface RightSidebarProps {
  symbol: string;
  setSymbol: (s: string) => void;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
}

// EXPANDED FOREX DATABASE
const FOREX_PAIRS: WatchlistItem[] = [
    // Majors
    { s: 'EURUSD', n: 'Euro / US Dollar', p: 1.0842, chg: -0.12, flag: 'green', type: 'forex', exchange: 'FXCM' },
    { s: 'GBPUSD', n: 'British Pound / US Dollar', p: 1.2612, chg: 0.05, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'USDJPY', n: 'US Dollar / Japanese Yen', p: 151.42, chg: 0.23, flag: 'red', type: 'forex', exchange: 'FXCM' },
    { s: 'USDCHF', n: 'US Dollar / Swiss Franc', p: 0.9020, chg: -0.15, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'AUDUSD', n: 'Australian Dollar / US Dollar', p: 0.6540, chg: -0.40, flag: 'none', type: 'forex', exchange: 'OANDA' },
    { s: 'USDCAD', n: 'US Dollar / Canadian Dollar', p: 1.3580, chg: 0.10, flag: 'none', type: 'forex', exchange: 'OANDA' },
    { s: 'NZDUSD', n: 'New Zealand Dollar / US Dollar', p: 0.6010, chg: -0.22, flag: 'none', type: 'forex', exchange: 'FXCM' },
    // Minors & Crosses
    { s: 'EURGBP', n: 'Euro / British Pound', p: 0.8560, chg: 0.02, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'EURJPY', n: 'Euro / Japanese Yen', p: 164.20, chg: 0.15, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'GBPJPY', n: 'British Pound / Japanese Yen', p: 191.50, chg: 0.30, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'AUDJPY', n: 'Australian Dollar / Japanese Yen', p: 98.50, chg: -0.10, flag: 'none', type: 'forex', exchange: 'OANDA' },
    { s: 'CADJPY', n: 'Canadian Dollar / Japanese Yen', p: 111.20, chg: 0.12, flag: 'none', type: 'forex', exchange: 'OANDA' },
    { s: 'CHFJPY', n: 'Swiss Franc / Japanese Yen', p: 168.10, chg: 0.05, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'EURCHF', n: 'Euro / Swiss Franc', p: 0.9750, chg: -0.05, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'EURAUD', n: 'Euro / Australian Dollar', p: 1.6520, chg: 0.20, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'EURCAD', n: 'Euro / Canadian Dollar', p: 1.4680, chg: -0.10, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'GBPAUD', n: 'British Pound / Australian Dollar', p: 1.9250, chg: 0.18, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'GBPCAD', n: 'British Pound / Canadian Dollar', p: 1.7120, chg: -0.05, flag: 'none', type: 'forex', exchange: 'FXCM' },
    { s: 'GBPCHF', n: 'British Pound / Swiss Franc', p: 1.1350, chg: 0.08, flag: 'none', type: 'forex', exchange: 'FXCM' },
    // Exotics
    { s: 'USDMXN', n: 'US Dollar / Mexican Peso', p: 16.50, chg: -0.50, flag: 'none', type: 'forex', exchange: 'OANDA' },
    { s: 'USDZAR', n: 'US Dollar / South African Rand', p: 18.80, chg: 0.40, flag: 'none', type: 'forex', exchange: 'OANDA' },
    { s: 'USDTRY', n: 'US Dollar / Turkish Lira', p: 32.10, chg: 0.80, flag: 'none', type: 'forex', exchange: 'OANDA' },
    { s: 'USDSEK', n: 'US Dollar / Swedish Krona', p: 10.60, chg: 0.10, flag: 'none', type: 'forex', exchange: 'OANDA' },
    { s: 'USDNOK', n: 'US Dollar / Norwegian Krone', p: 10.80, chg: 0.15, flag: 'none', type: 'forex', exchange: 'OANDA' },
];

const OTHER_ASSETS: WatchlistItem[] = [
    { s: 'BTCUSD', n: 'Bitcoin / US Dollar', p: 64230, chg: 1.45, flag: 'none', type: 'crypto', exchange: 'BINANCE' },
    { s: 'ETHUSD', n: 'Ethereum / US Dollar', p: 3450, chg: 1.10, flag: 'none', type: 'crypto', exchange: 'COINBASE' },
    { s: 'SOLUSD', n: 'Solana / US Dollar', p: 145.20, chg: 5.40, flag: 'green', type: 'crypto', exchange: 'BINANCE' },
    { s: 'AAPL', n: 'Apple Inc', p: 173.50, chg: -0.50, flag: 'blue', type: 'stock', exchange: 'NASDAQ' },
    { s: 'TSLA', n: 'Tesla Inc', p: 175.20, chg: -1.20, flag: 'red', type: 'stock', exchange: 'NASDAQ' },
    { s: 'NVDA', n: 'NVIDIA Corp', p: 880.10, chg: 2.30, flag: 'yellow', type: 'stock', exchange: 'NASDAQ' },
    { s: 'US500', n: 'S&P 500 Index', p: 5210.5, chg: 0.4, flag: 'none', type: 'index', exchange: 'CME' },
    { s: 'DX1!', n: 'US Dollar Currency Index', p: 104.20, chg: 0.05, flag: 'none', type: 'futures', exchange: 'ICE' },
    { s: 'XAUUSD', n: 'Gold / US Dollar', p: 2350.10, chg: 0.80, flag: 'green', type: 'cfd', exchange: 'OANDA' },
];

const FULL_DATABASE = [...FOREX_PAIRS, ...OTHER_ASSETS];

const RightSidebar: React.FC<RightSidebarProps> = ({ symbol, setSymbol, user, setUser }) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'ai' | 'mt5'>('ai');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'system', type: 'text', content: 'Nibra Intelligence Active.', timestamp: Date.now() }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(FULL_DATABASE.slice(0, 12)); 
  const [isAddingSymbol, setIsAddingSymbol] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFlagFilter, setActiveFlagFilter] = useState<WatchlistFlag | 'all'>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<AssetType | 'all'>('all');

  const [safetySteps, setSafetySteps] = useState<SafetyStep[]>([
     { id: 1, label: 'Data Fetch', status: 'pending' },
     { id: 2, label: 'MTF Sync', status: 'pending' },
     { id: 3, label: 'Market Health', status: 'pending' },
     { id: 4, label: 'Risk Protocol', status: 'pending' },
     { id: 5, label: 'Approval', status: 'pending' },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', type: 'text', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const reasoning = await generateStrategyReasoning(input, `Symbol: ${symbol}`);
    if (reasoning) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', type: 'reasoning', content: reasoning, timestamp: Date.now() }]);
        safetySteps.forEach((_, i) => {
            setTimeout(() => {
                setSafetySteps(prev => prev.map(s => s.id === i + 1 ? { ...s, status: 'success' } : s));
            }, i * 800);
        });
    }
  };

  const handleAddSymbol = (item: WatchlistItem) => {
      if (!watchlist.find(w => w.s === item.s)) {
          setWatchlist([...watchlist, item]);
      }
      setIsAddingSymbol(false);
      setSearchQuery('');
  };

  const toggleFlag = (symbol: string, currentFlag: WatchlistFlag, e: React.MouseEvent) => {
      e.stopPropagation();
      const flags: WatchlistFlag[] = ['none', 'red', 'green', 'blue', 'yellow'];
      const nextIndex = (flags.indexOf(currentFlag) + 1) % flags.length;
      const nextFlag = flags[nextIndex];
      setWatchlist(prev => prev.map(item => item.s === symbol ? { ...item, flag: nextFlag } : item));
  };

  const getFlagColor = (flag: WatchlistFlag) => {
      switch(flag) {
          case 'red': return 'text-tv-red';
          case 'green': return 'text-tv-green';
          case 'blue': return 'text-tv-blue';
          case 'yellow': return 'text-yellow-500';
          default: return 'text-gray-300';
      }
  };

  const getSymbolIcon = (item: WatchlistItem) => {
      if (item.type === 'crypto') return <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-[10px]"><Bitcoin size={12} strokeWidth={2.5}/></div>;
      if (item.type === 'forex') return <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-[8px] flex-col leading-none border border-green-200"><span className="scale-[0.6]">FX</span></div>;
      if (item.type === 'stock') return <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[8px]"><Briefcase size={10} strokeWidth={2.5}/></div>;
      if (item.type === 'index') return <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[8px]"><Globe size={10} strokeWidth={2.5}/></div>;
      if (item.type === 'futures') return <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-[8px]"><Clock size={10} strokeWidth={2.5}/></div>;
      if (item.type === 'cfd') return <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-[8px]"><BarChart3 size={10} strokeWidth={2.5}/></div>;
      return <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><TrendingUp size={12} strokeWidth={2} /></div>;
  };

  const filteredWatchlist = watchlist.filter(item => {
      const matchFlag = activeFlagFilter === 'all' || item.flag === activeFlagFilter;
      const matchType = activeTypeFilter === 'all' || item.type === activeTypeFilter;
      return matchFlag && matchType;
  });

  const CategoryButton: React.FC<{ label: string, type: AssetType | 'all' }> = ({ label, type }) => (
      <button 
        onClick={() => setActiveTypeFilter(type)}
        className={`px-2 py-1 text-[10px] font-bold rounded whitespace-nowrap transition-colors ${activeTypeFilter === type ? 'bg-tv-blue text-white' : 'bg-gray-100 text-tv-textSec hover:bg-gray-200'}`}
      >
          {label}
      </button>
  );

  return (
    <aside className="w-[320px] bg-white border-l border-tv-border flex flex-col h-full z-40 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
      <div className="flex border-b border-tv-border bg-white">
        <button onClick={() => setActiveTab('watchlist')} className={`flex-1 py-3 text-xs font-semibold border-b-2 ${activeTab === 'watchlist' ? 'text-tv-blue border-tv-blue bg-blue-50/50' : 'text-tv-textSec border-transparent hover:bg-gray-50'}`}>Watchlist</button>
        <button onClick={() => setActiveTab('ai')} className={`flex-1 py-3 text-xs font-semibold border-b-2 flex items-center justify-center gap-1 ${activeTab === 'ai' ? 'text-tv-blue border-tv-blue bg-blue-50/50' : 'text-tv-textSec border-transparent hover:bg-gray-50'}`}><BrainCircuit size={14} /> NibraAI</button>
        <button onClick={() => setActiveTab('mt5')} className={`flex-1 py-3 text-xs font-semibold border-b-2 flex items-center justify-center gap-1 ${activeTab === 'mt5' ? 'text-tv-blue border-tv-blue bg-blue-50/50' : 'text-tv-textSec border-transparent hover:bg-gray-50'}`}><SettingsIcon size={14} /> MT5</button>
      </div>

      <div className="flex-1 overflow-hidden bg-[#ffffff] relative flex flex-col">
        {activeTab === 'watchlist' && (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-tv-border overflow-x-auto scrollbar-hide bg-white">
                    <CategoryButton label="All" type="all" />
                    <CategoryButton label="Forex" type="forex" />
                    <CategoryButton label="Stocks" type="stock" />
                    <CategoryButton label="Crypto" type="crypto" />
                    <CategoryButton label="Indices" type="index" />
                    <CategoryButton label="Futures" type="futures" />
                </div>

                <div className="flex items-center px-2 py-1 border-b border-tv-border gap-2 bg-gray-50/50">
                    <button onClick={() => setActiveFlagFilter('all')} className={`text-[10px] px-2 py-0.5 rounded ${activeFlagFilter === 'all' ? 'bg-gray-200 font-bold text-tv-text' : 'text-tv-textSec'}`}>All Flags</button>
                    <button onClick={() => setActiveFlagFilter('red')} className="text-tv-red hover:bg-red-50 p-1 rounded"><Flag size={12} fill="currentColor" /></button>
                    <button onClick={() => setActiveFlagFilter('green')} className="text-tv-green hover:bg-green-50 p-1 rounded"><Flag size={12} fill="currentColor" /></button>
                    <button onClick={() => setActiveFlagFilter('blue')} className="text-tv-blue hover:bg-blue-50 p-1 rounded"><Flag size={12} fill="currentColor" /></button>
                </div>

                <div className="p-2 border-b border-tv-border bg-white">
                    <div className="relative">
                        {isAddingSymbol ? (
                            <div className="flex flex-col gap-2 bg-white border border-tv-border shadow-lg rounded-lg absolute top-0 left-0 w-full z-50 p-2 h-[300px]">
                                <div className="flex items-center gap-2">
                                    <Search size={14} className="text-tv-textSec" />
                                    <input 
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search symbol..."
                                        className="flex-1 bg-transparent border-none text-xs focus:ring-0 outline-none"
                                    />
                                    <button onClick={() => setIsAddingSymbol(false)} className="p-1 hover:bg-gray-200 rounded"><X size={14} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto border-t border-tv-border mt-1 pt-1">
                                    {FULL_DATABASE.filter(i => i.s.includes(searchQuery.toUpperCase()) || i.n.toUpperCase().includes(searchQuery.toUpperCase())).map(item => (
                                        <div key={item.s} onClick={() => handleAddSymbol(item)} className="flex items-center justify-between px-2 py-2 hover:bg-blue-50 cursor-pointer rounded border-b border-gray-50 last:border-none">
                                            <div className="flex items-center gap-2">
                                                {getSymbolIcon(item)}
                                                <div>
                                                    <p className="text-xs font-bold text-tv-text">{item.s}</p>
                                                    <p className="text-[10px] text-tv-textSec">{item.n}</p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-bold text-tv-textSec bg-gray-100 px-1 rounded">{item.exchange}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div 
                                onClick={() => setIsAddingSymbol(true)}
                                className="flex items-center gap-2 bg-gray-100 text-tv-textSec px-2 py-1.5 rounded cursor-text hover:bg-gray-200 transition-colors"
                            >
                                <Plus size={14} />
                                <span className="text-xs">Add Symbol</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {filteredWatchlist.map((item) => (
                        <div key={item.s} onClick={() => setSymbol(item.s)} className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer group border-b border-gray-50 transition-all ${symbol === item.s ? 'bg-blue-50 border-l-2 border-l-tv-blue' : ''}`}>
                            <div className="flex items-center gap-3">
                                {getSymbolIcon(item)}
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-tv-text">{item.s}</span>
                                    <span className="text-[10px] font-medium text-tv-textSec tracking-wide uppercase">{item.n.split(' / ')[0]}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                 <div className="flex flex-col items-end">
                                    <span className={`text-sm font-mono font-medium ${item.chg >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>{item.p > 0 ? item.p : '-'}</span>
                                    <span className={`text-[10px] ${item.chg >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>{item.chg > 0 ? '+' : ''}{item.chg}%</span>
                                </div>
                                <button onClick={(e) => toggleFlag(item.s, item.flag, e)} className={`${getFlagColor(item.flag)} hover:opacity-80`}>
                                    <Flag size={14} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {activeTab === 'ai' && (
            <div className="flex flex-col h-full bg-[#f8f9fd] p-4">
                 <div className="flex-1 flex items-center justify-center text-tv-textSec text-sm">AI Chat Active</div>
                 <input className="w-full p-2 border rounded" placeholder="Ask Nibra..." />
            </div>
        )}
        {activeTab === 'mt5' && <div className="p-4">MT5 Settings</div>}
      </div>
    </aside>
  );
};

export default RightSidebar;
