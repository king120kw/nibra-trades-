
export interface Candle {
  time: number; // Unix timestamp for Lightweight Charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface AIReasoningResponse {
  understanding: string;
  strategy_logic: string;
  market_conditions: string;
  risk_parameters: string;
  warnings: string[];
  questions: string[];
  suggested_path?: 'automation_indicator' | 'indicator_only';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string | AIReasoningResponse;
  type: 'text' | 'reasoning' | 'code' | 'audio';
  timestamp: number;
  attachments?: string[];
}

export interface SafetyStep {
  id: number;
  label: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  details?: string;
}

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W' | '1M';
export type ChartType = 'Area' | 'Candle' | 'Line' | 'Bar'; 

// EXPANDED DRAWING TOOLS
export type DrawingTool = 
  | 'cursor' 
  | 'trendline' | 'ray' | 'extended' | 'info_line' 
  | 'fib_retracement' | 'fib_extension'
  | 'rect' | 'circle' | 'triangle' 
  | 'text' | 'callout'
  | 'long_pos' | 'short_pos' | 'price_range';

export interface Drawing {
  id: string;
  type: DrawingTool;
  points: { x: number; y: number }[]; 
  color: string;
  text?: string;
  data?: any; // For specific tool data (e.g. risk/reward ratio)
  locked?: boolean;
}

export interface MT5Settings {
  connected: boolean;
  accountId?: string;
  balance: number;
  riskPerTrade: number;
  dailyStopLoss: number;
  tradesPerDay: number;
  rewardRatio: number;
}

export interface BacktestResult {
  netProfit: number;
  totalTrades: number;
  percentProfitable: number;
  profitFactor: number;
  maxDrawdown: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  mt5: MT5Settings;
}

export interface ChartSettings {
  backgroundColor: string;
  gridColor: string;
  candleUpColor: string;
  candleDownColor: string;
  wickUpColor: string;
  wickDownColor: string;
  textColor: string;
}

export type WatchlistFlag = 'red' | 'green' | 'blue' | 'yellow' | 'none';
export type AssetType = 'stock' | 'forex' | 'crypto' | 'index' | 'futures' | 'cfd';

export interface WatchlistItem {
    s: string; // symbol
    n: string; // name
    p: number; // price
    chg: number; // change
    flag: WatchlistFlag;
    type: AssetType;
    exchange?: string; // e.g. FXCM, BINANCE
}

export interface ToolGroup {
    id: string;
    icon: any;
    items: { id: DrawingTool; label: string; icon?: any }[];
}
