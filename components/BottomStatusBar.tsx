import React from 'react';
import { Timeframe } from '../types';

interface Props {
    symbol: string;
    timeframe: Timeframe;
}

const BottomStatusBar: React.FC<Props> = ({ symbol, timeframe }) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' });

  return (
    <footer className="h-[28px] bg-white border-t border-tv-border flex items-center px-3 text-[11px] text-tv-text select-none z-50">
      <div className="flex items-center gap-4 font-medium">
        <span className="hover:text-tv-blue cursor-pointer">{symbol}</span>
        <span className="hover:text-tv-blue cursor-pointer">{timeframe}</span>
        <span className="text-tv-textSec">Market Open</span>
      </div>
      
      <div className="flex-1 flex justify-center text-tv-textSec">
         Range: 120 bars • 4d 12h
      </div>

      <div className="flex items-center gap-4 text-tv-textSec">
        <span>UTC {currentTime}</span>
        <span className="hover:text-tv-text cursor-pointer">log</span>
        <span className="hover:text-tv-text cursor-pointer">auto</span>
      </div>
    </footer>
  );
};

export default BottomStatusBar;