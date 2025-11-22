
import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import LeftToolbar from './components/LeftToolbar';
import ChartArea from './components/ChartArea';
import RightSidebar from './components/RightSidebar';
import BottomStatusBar from './components/BottomStatusBar';
import { Timeframe, ChartType, DrawingTool, UserProfile, BacktestResult, Drawing, ChartSettings } from './types';
import { ChevronUp, PlayCircle, AlertTriangle, X, Mail, Lock, User } from 'lucide-react';

const App: React.FC = () => {
  const [symbol, setSymbol] = useState('DX1!');
  const [timeframe, setTimeframe] = useState<Timeframe>('30m');
  const [chartType, setChartType] = useState<ChartType>('Candle');
  const [activeTool, setActiveTool] = useState<DrawingTool>('cursor');
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  
  const [settings, setSettings] = useState<ChartSettings>({
    backgroundColor: '#ffffff',
    gridColor: '#f0f3fa',
    candleUpColor: '#089981',
    candleDownColor: '#f23645',
    wickUpColor: '#089981',
    wickDownColor: '#f23645',
    textColor: '#131722'
  });
  const [showSettings, setShowSettings] = useState(false);

  const [user, setUser] = useState<UserProfile>({
    name: '',
    email: '',
    isLoggedIn: false,
    avatarUrl: '',
    mt5: {
      connected: false,
      balance: 100000,
      riskPerTrade: 1,
      dailyStopLoss: 5,
      tradesPerDay: 3,
      rewardRatio: 2
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('nibra_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setShowAuthModal(false);
    } else {
      setShowAuthModal(true);
    }
  }, []);

  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'tester' | 'editor' | 'trading'>('tester');

  const backtestResults: BacktestResult = {
    netProfit: 12450.50,
    totalTrades: 84,
    percentProfitable: 62.5,
    profitFactor: 1.85,
    maxDrawdown: 4.2
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${authForm.email}`;
    const newUser: UserProfile = {
      ...user,
      isLoggedIn: true,
      name: authMode === 'signup' ? authForm.name : (authForm.email.split('@')[0] || 'User'),
      email: authForm.email,
      avatarUrl: avatarUrl,
    };
    setUser(newUser);
    localStorage.setItem('nibra_user', JSON.stringify(newUser));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('nibra_user');
    setUser(prev => ({ ...prev, isLoggedIn: false, name: '', email: '', avatarUrl: '' }));
    setShowAuthModal(true);
    setAuthMode('login');
    setAuthForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-tv-text font-sans overflow-hidden">
      
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-[400px] border border-tv-border">
            <div className="flex justify-between items-center p-4 border-b border-tv-border">
              <h3 className="font-bold text-tv-text">Chart Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">Background</span>
                 <input type="color" value={settings.backgroundColor} onChange={(e) => setSettings({...settings, backgroundColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">Grid Lines</span>
                 <input type="color" value={settings.gridColor} onChange={(e) => setSettings({...settings, gridColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
               </div>
               <div className="h-px bg-gray-100 my-2"></div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium text-tv-green">Candle Up</span>
                 <input type="color" value={settings.candleUpColor} onChange={(e) => setSettings({...settings, candleUpColor: e.target.value, wickUpColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium text-tv-red">Candle Down</span>
                 <input type="color" value={settings.candleDownColor} onChange={(e) => setSettings({...settings, candleDownColor: e.target.value, wickDownColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer" />
               </div>
            </div>
            <div className="p-4 border-t border-tv-border bg-gray-50 flex justify-end">
               <button onClick={() => setShowSettings(false)} className="px-4 py-2 bg-tv-blue text-white rounded font-medium text-sm hover:bg-blue-700">Done</button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[400px] relative border border-gray-200">
            <div className="flex justify-center mb-6">
               <svg width="48" height="48" viewBox="0 0 28 28" fill="none" className="drop-shadow-xl">
                    <rect width="28" height="28" rx="6" fill="#131722"/>
                    <path d="M5 8V20H7.5L10.5 14.5V20H13V8H10.5L7.5 13.5V8H5Z" fill="white"/>
                    <path d="M15 8V20H19.5C21.5 20 23 19 23 17C23 15.5 22 14.5 21 14C22 13.5 23 12.5 23 11C23 9 21.5 8 19.5 8H15ZM17.5 10H19.5C20 10 20.5 10.5 20.5 11C20.5 11.5 20 12 19.5 12H17.5V10ZM17.5 16V18H19.5C20 18 20.5 17.5 20.5 17C20.5 16.5 20 16 19.5 16H17.5Z" fill="white"/>
                </svg>
            </div>
            <h2 className="text-2xl font-bold mb-1 text-center text-tv-black">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-center text-tv-textSec text-sm mb-6">
              {authMode === 'login' ? 'Enter your credentials to access the terminal' : 'Join the intelligent trading network'}
            </p>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required 
                    value={authForm.name}
                    onChange={e => setAuthForm({...authForm, name: e.target.value})}
                    className="w-full p-3 pl-10 bg-gray-50 border border-tv-border rounded-lg focus:border-tv-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" 
                    placeholder="Full Name" 
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required 
                  value={authForm.email}
                  onChange={e => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full p-3 pl-10 bg-gray-50 border border-tv-border rounded-lg focus:border-tv-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" 
                  placeholder="Email Address" 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required 
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full p-3 pl-10 bg-gray-50 border border-tv-border rounded-lg focus:border-tv-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" 
                  placeholder="Password" 
                />
              </div>
              
              <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg mt-2">
                {authMode === 'login' ? 'Enter Terminal' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button 
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="font-bold text-tv-blue hover:underline"
              >
                {authMode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TopBar 
        symbol={symbol} 
        timeframe={timeframe} 
        setTimeframe={setTimeframe} 
        chartType={chartType}
        setChartType={setChartType}
        user={user}
        onLogout={handleLogout}
        openSettings={() => setShowSettings(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftToolbar 
            activeTool={activeTool} 
            setActiveTool={setActiveTool} 
            onClearDrawings={() => setDrawings([])}
        />
        
        <main className="flex-1 flex flex-col relative">
          <ChartArea 
            symbol={symbol} 
            chartType={chartType} 
            activeTool={activeTool}
            timeframe={timeframe}
            settings={settings}
            drawings={drawings}
            setDrawings={setDrawings}
          />
          
          <div className={`bg-white border-t border-tv-border transition-all duration-300 flex flex-col z-30 ${showBottomPanel ? 'h-[300px]' : 'h-[35px]'}`}>
            <div className="flex items-center border-b border-tv-border bg-white px-2">
               <button 
                 onClick={() => setShowBottomPanel(!showBottomPanel)}
                 className="p-1 hover:bg-tv-gray rounded mr-2 text-tv-textSec"
               >
                 <ChevronUp size={16} className={`transition-transform ${showBottomPanel ? 'rotate-180' : ''}`} />
               </button>
               
               <div className="flex gap-4">
                  <button onClick={() => { setActiveBottomTab('tester'); setShowBottomPanel(true); }} className={`h-[34px] text-xs font-semibold border-b-2 px-2 transition-colors ${activeBottomTab === 'tester' && showBottomPanel ? 'border-tv-blue text-tv-blue' : 'border-transparent text-tv-textSec hover:text-tv-text'}`}>
                    Strategy Tester
                  </button>
                  <button onClick={() => { setActiveBottomTab('editor'); setShowBottomPanel(true); }} className={`h-[34px] text-xs font-semibold border-b-2 px-2 transition-colors ${activeBottomTab === 'editor' && showBottomPanel ? 'border-tv-blue text-tv-blue' : 'border-transparent text-tv-textSec hover:text-tv-text'}`}>
                    Pine Editor
                  </button>
                  <button onClick={() => { setActiveBottomTab('trading'); setShowBottomPanel(true); }} className={`h-[34px] text-xs font-semibold border-b-2 px-2 transition-colors ${activeBottomTab === 'trading' && showBottomPanel ? 'border-tv-blue text-tv-blue' : 'border-transparent text-tv-textSec hover:text-tv-text'}`}>
                    Trading Panel
                  </button>
               </div>
            </div>

            {showBottomPanel && activeBottomTab === 'tester' && (
                <div className="flex-1 overflow-auto bg-gray-50 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-tv-text">Nibra Strategy v4.0 <span className="text-xs font-normal text-tv-textSec bg-gray-200 px-1.5 py-0.5 rounded ml-2">Deep Learning</span></h3>
                            <p className="text-xs text-tv-textSec">Backtest range: 2023-01-01 to 2023-12-31</p>
                        </div>
                        <div className="flex gap-2">
                           <button className="flex items-center gap-1 bg-tv-blue text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700"><PlayCircle size={14}/> Start Test</button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4">
                        <div className="bg-white p-3 rounded border border-tv-border shadow-sm">
                            <p className="text-xs text-tv-textSec uppercase font-bold">Net Profit</p>
                            <p className={`text-xl font-bold ${backtestResults.netProfit > 0 ? 'text-tv-green' : 'text-tv-red'}`}>${backtestResults.netProfit.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-3 rounded border border-tv-border shadow-sm">
                            <p className="text-xs text-tv-textSec uppercase font-bold">Total Trades</p>
                            <p className="text-xl font-bold text-tv-text">{backtestResults.totalTrades}</p>
                        </div>
                    </div>
                </div>
            )}
          </div>

          <BottomStatusBar symbol={symbol} timeframe={timeframe} />
        </main>

        <RightSidebar 
          symbol={symbol} 
          setSymbol={setSymbol}
          user={user}
          setUser={setUser}
        />
      </div>
    </div>
  );
};

export default App;
