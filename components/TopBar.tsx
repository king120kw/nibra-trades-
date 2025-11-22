
import React, { useState } from 'react';
import { ChevronDown, Bell, MonitorPlay, BarChart2, Activity, LogOut, User as UserIcon, CandlestickChart, Settings, Search, Layout, Undo2, Redo2, Play, Pause, FastForward, SkipBack } from 'lucide-react';
import { Timeframe, ChartType, UserProfile } from '../types';

interface TopBarProps {
  symbol: string;
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
  chartType: ChartType;
  setChartType: (t: ChartType) => void;
  user: UserProfile;
  onLogout: () => void;
  openSettings: () => void;
}

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M'];

const TopBar: React.FC<TopBarProps> = ({ symbol, timeframe, setTimeframe, chartType, setChartType, user, onLogout, openSettings }) => {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Replay State (Mock)
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <header className="h-[48px] bg-white border-b border-tv-border flex items-center px-3 select-none z-50 relative shadow-sm">
      {/* Left Section: Logo & Symbol */}
      <div className="flex items-center h-full mr-4">
        {/* GEOMETRIC NB LOGO - SVG */}
        <div className="flex items-center gap-2 mr-4 cursor-pointer group">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="6" fill="#131722"/>
                {/* Geometric 'N' */}
                <path d="M5 8V20H7.5L10.5 14.5V20H13V8H10.5L7.5 13.5V8H5Z" fill="white"/>
                {/* Geometric 'B' */}
                <path d="M15 8V20H19.5C21.5 20 23 19 23 17C23 15.5 22 14.5 21 14C22 13.5 23 12.5 23 11C23 9 21.5 8 19.5 8H15ZM17.5 10H19.5C20 10 20.5 10.5 20.5 11C20.5 11.5 20 12 19.5 12H17.5V10ZM17.5 16V18H19.5C20 18 20.5 17.5 20.5 17C20.5 16.5 20 16 19.5 16H17.5Z" fill="white"/>
            </svg>
        </div>
        
        <div className="flex items-center border-r border-tv-border pr-4 h-6 cursor-pointer hover:bg-tv-gray p-1 rounded group transition-colors">
          <span className="font-bold text-tv-text text-sm mr-2 group-hover:text-tv-black">{symbol}</span>
          <div className="flex items-center gap-1">
            <span className="bg-gray-100 text-[10px] px-1 rounded text-tv-textSec font-medium group-hover:bg-gray-200">FXCM</span>
          </div>
        </div>

        <div className="flex items-center px-4 gap-3 hidden lg:flex">
           <div className="flex flex-col leading-none">
             <span className="text-lg font-bold text-tv-text">99.685</span>
           </div>
           <div className="flex flex-col leading-none">
             <span className="text-xs font-bold text-tv-green flex items-center">
               +0.03 (+0.03%)
             </span>
             <span className="text-[10px] text-tv-textSec text-right">Market Open</span>
           </div>
        </div>
      </div>

      {/* Center Section: Timeframes */}
      <div className="hidden md:flex items-center h-full gap-0.5 overflow-x-auto scrollbar-hide border-l border-tv-border pl-2">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-2.5 h-[28px] text-[13px] font-bold rounded hover:bg-tv-gray transition-colors ${
              timeframe === tf ? 'text-tv-blue bg-blue-50' : 'text-tv-text'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Replay Controls (Center Overlay if active, otherwise right) */}
      {isReplayMode ? (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg border border-tv-border rounded-full px-4 py-1 flex items-center gap-4">
              <button className="hover:text-tv-blue"><SkipBack size={16} /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="text-tv-blue hover:scale-110 transition-transform">
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <button className="hover:text-tv-blue"><FastForward size={16} /></button>
              <div className="w-px h-4 bg-gray-300"></div>
              <button onClick={() => setIsReplayMode(false)} className="text-xs font-bold text-tv-red hover:bg-red-50 px-2 py-1 rounded">EXIT</button>
          </div>
      ) : null}


      {/* Right Section: Tools */}
      <div className="flex items-center gap-1">
        {/* Chart Type Selector */}
        <div className="relative">
          <button 
            className="w-9 h-9 flex items-center justify-center hover:bg-tv-gray rounded text-tv-textSec transition-colors"
            onClick={() => setShowTypeMenu(!showTypeMenu)}
            title="Chart Style"
          >
              {chartType === 'Candle' ? <CandlestickChart size={20} /> : chartType === 'Line' ? <Activity size={20} /> : <BarChart2 size={20} />}
          </button>
          {showTypeMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-40 bg-white border border-tv-border shadow-lg rounded-md py-1 z-50">
              <button onClick={() => { setChartType('Candle'); setShowTypeMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-tv-gray flex items-center gap-3 ${chartType === 'Candle' ? 'bg-blue-50 text-tv-blue' : ''}`}>
                <CandlestickChart size={16} /> Candles
              </button>
              <button onClick={() => { setChartType('Area'); setShowTypeMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-tv-gray flex items-center gap-3 ${chartType === 'Area' ? 'bg-blue-50 text-tv-blue' : ''}`}>
                <Activity size={16} /> Area
              </button>
              <button onClick={() => { setChartType('Line'); setShowTypeMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-tv-gray flex items-center gap-3 ${chartType === 'Line' ? 'bg-blue-50 text-tv-blue' : ''}`}>
                <BarChart2 size={16} /> Line
              </button>
            </div>
          )}
        </div>
        
        <button className="px-3 h-8 hover:bg-tv-gray rounded text-tv-textSec flex items-center gap-2 group transition-colors">
          <Activity size={18} className="text-tv-textSec group-hover:text-tv-blue"/>
          <span className="text-sm font-medium text-tv-text group-hover:text-tv-blue hidden sm:block">Indicators</span>
        </button>

        <div className="h-5 w-[1px] bg-tv-border mx-2"></div>

        {/* Undo/Redo */}
        <div className="hidden xl:flex items-center">
            <button className="w-9 h-9 flex items-center justify-center hover:bg-tv-gray rounded text-tv-textSec"><Undo2 size={18} /></button>
            <button className="w-9 h-9 flex items-center justify-center hover:bg-tv-gray rounded text-tv-textSec"><Redo2 size={18} /></button>
        </div>

        {/* Layout */}
        <button className="w-9 h-9 flex items-center justify-center hover:bg-tv-gray rounded text-tv-textSec hidden lg:flex">
            <Layout size={18} />
        </button>

        {/* Settings Trigger */}
        <button 
          onClick={openSettings}
          className="w-9 h-9 flex items-center justify-center hover:bg-tv-gray rounded text-tv-textSec"
          title="Chart Settings"
        >
          <Settings size={18} />
        </button>

        {/* Alert & Replay */}
        <div className="flex items-center gap-1">
           <button className="w-9 h-9 flex items-center justify-center hover:bg-tv-gray rounded text-tv-textSec relative">
             <Bell size={18} />
           </button>
           <button 
             onClick={() => setIsReplayMode(!isReplayMode)}
             className={`w-9 h-9 flex items-center justify-center hover:bg-tv-gray rounded transition-colors ${isReplayMode ? 'text-tv-blue bg-blue-50' : 'text-tv-textSec'}`}
             title="Bar Replay"
           >
             <MonitorPlay size={18} />
           </button>
        </div>

        {/* Publish Button */}
        <button className="ml-2 bg-tv-blue hover:bg-blue-700 text-white px-4 py-1.5 rounded shadow-sm text-sm font-semibold transition-all hidden sm:block">
          Publish
        </button>
        
        {/* User Profile */}
        <div className="relative ml-3 pl-3 border-l border-tv-border">
          <button 
            className="flex items-center gap-2 hover:bg-tv-gray rounded-full p-1 pr-2 transition-colors"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
             {user.isLoggedIn && user.avatarUrl ? (
                 <img src={user.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-tv-border" />
             ) : (
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${user.isLoggedIn ? 'bg-purple-600' : 'bg-gray-300'}`}>
                   {user.isLoggedIn ? user.name.charAt(0) : <UserIcon size={16} />}
                 </div>
             )}
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-tv-border shadow-xl rounded-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {user.isLoggedIn ? (
                <>
                  <div className="px-4 py-3 border-b border-tv-border bg-gray-50 flex items-center gap-3">
                    <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-tv-border" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-tv-text truncate">{user.name}</p>
                      <p className="text-xs text-tv-textSec truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-tv-gray">Profile Settings</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-tv-gray">Billing</button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-tv-gray">Refer a Friend</button>
                  </div>
                  <div className="border-t border-tv-border mt-1 pt-1">
                    <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-4 text-center">
                  <p className="text-sm text-tv-textSec mb-3">Sign in to sync your chart</p>
                  <button className="w-full bg-tv-blue text-white py-2 rounded font-bold text-sm">Sign In</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
