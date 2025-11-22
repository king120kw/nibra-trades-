
import React, { useState, useRef, useEffect } from 'react';
import { 
    createChart, 
    ColorType, 
    CrosshairMode, 
    ISeriesApi, 
    IChartApi, 
    UTCTimestamp,
    Time,
    AreaSeries,
    LineSeries,
    CandlestickSeries
} from 'lightweight-charts';
import { Lock, Trash2 } from 'lucide-react';
import { Candle, ChartType, DrawingTool, Drawing, Timeframe, ChartSettings } from '../types';

interface ChartAreaProps {
  symbol: string;
  chartType: ChartType;
  activeTool: DrawingTool;
  timeframe: Timeframe;
  settings: ChartSettings;
  drawings: Drawing[];
  setDrawings: React.Dispatch<React.SetStateAction<Drawing[]>>;
}

const ChartArea: React.FC<ChartAreaProps> = ({ 
  symbol, 
  chartType, 
  activeTool, 
  timeframe,
  settings,
  drawings,
  setDrawings
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  
  // --- DATA PHYSICS ENGINE ---
  
  // 1. Exact Time Intervals
  const getTfSeconds = (tf: Timeframe): number => {
      switch(tf) {
          case '1m': return 60;
          case '5m': return 300;
          case '15m': return 900;
          case '30m': return 1800;
          case '1h': return 3600;
          case '4h': return 14400;
          case '1D': return 86400;
          case '1W': return 604800;
          case '1M': return 2592000;
          default: return 3600;
      }
  };

  // 2. Volatility Scaling (Square Root of Time Rule)
  const getVolatilityMultiplier = (tf: Timeframe): number => {
     switch(tf) {
        case '1m': return 1; 
        case '5m': return 2.2; 
        case '15m': return 3.8;
        case '30m': return 5.4;
        case '1h': return 7.7;
        case '4h': return 15.4;
        case '1D': return 37.9; 
        case '1W': return 100;
        case '1M': return 200;
        default: return 10;
    }
  };

  // Base Price Logic
  const getBasePrice = (sym: string) => {
      if(sym.includes('EUR')) return 1.0842;
      if(sym.includes('GBP')) return 1.2612;
      if(sym.includes('JPY')) return 151.42;
      if(sym.includes('AUD')) return 0.6540;
      if(sym.includes('BTC')) return 64230;
      if(sym.includes('ETH')) return 3450;
      if(sym.includes('XAU') || sym.includes('GOLD')) return 2350;
      if(sym.includes('SPX') || sym.includes('US500')) return 5200;
      return 100.00; 
  };

  // Realistic Data Generator
  const generateData = (tf: Timeframe, sym: string) => {
      const initialData: Candle[] = [];
      const intervalSeconds = getTfSeconds(tf);
      const volatilityMult = getVolatilityMultiplier(tf);
      
      // Start 1000 bars ago
      let time = Math.floor(Date.now() / 1000) - (1000 * intervalSeconds);
      let price = getBasePrice(sym);
      
      // Base volatility factor (0.005% of price)
      const baseVol = price * 0.00005; 

      for(let i=0; i<1000; i++) {
          // Random Walk
          const vol = baseVol * volatilityMult;
          const change = (Math.random() - 0.5) * vol * 2; 
          
          let open = price;
          let close = price + change;
          let high = Math.max(open, close) + (Math.random() * vol);
          let low = Math.min(open, close) - (Math.random() * vol);
          
          initialData.push({
              time: (time + i * intervalSeconds) as UTCTimestamp,
              open, high, low, close
          });
          price = close;
      }
      return initialData;
  };

  // Chart Initialization
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: settings.backgroundColor },
        textColor: settings.textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      grid: {
        vertLines: { color: settings.gridColor },
        horzLines: { color: settings.gridColor },
      },
      timeScale: {
        rightOffset: 12,
        timeVisible: true,
        secondsVisible: timeframe === '1m' || timeframe === '5m',
      },
      rightPriceScale: {
        scaleMargins: { top: 0.1, bottom: 0.1 },
        borderColor: settings.gridColor,
      },
      crosshair: { mode: CrosshairMode.Normal }
    });

    let newSeries: ISeriesApi<any>;
    const data = generateData(timeframe, symbol);
    
    // Ensure we have data before setting current price
    if (data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
    }

    // V5 API USAGE (Factory Methods)
    if (chartType === 'Area') {
        newSeries = chart.addSeries(AreaSeries, { 
            lineColor: '#2962ff', 
            topColor: '#2962ff', 
            bottomColor: 'rgba(41, 98, 255, 0.28)' 
        });
        newSeries.setData(data.map(d => ({ time: d.time, value: d.close })));
    } else if (chartType === 'Line') {
        newSeries = chart.addSeries(LineSeries, { 
            color: '#2962ff' 
        });
        newSeries.setData(data.map(d => ({ time: d.time, value: d.close })));
    } else {
        newSeries = chart.addSeries(CandlestickSeries, {
            upColor: settings.candleUpColor,
            downColor: settings.candleDownColor,
            wickUpColor: settings.wickUpColor,
            wickDownColor: settings.wickDownColor,
        });
        newSeries.setData(data);
    }

    chartRef.current = chart;
    seriesRef.current = newSeries;

    const handleResize = () => {
        if(chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
        }
    };
    window.addEventListener('resize', handleResize);

    return () => { 
        window.removeEventListener('resize', handleResize);
        chart.remove(); 
    };
  }, [timeframe, chartType, settings, symbol]); 

  // Live Simulation (Micro-ticks)
  useEffect(() => {
     const interval = setInterval(() => {
         if(seriesRef.current) {
             setCurrentPrice(prev => {
                 const volatilityMult = getVolatilityMultiplier(timeframe);
                 
                 // Micro movement (much smaller than bar volatility)
                 const microVol = (prev * 0.00001) * Math.sqrt(volatilityMult); 
                 const change = (Math.random() - 0.5) * microVol;
                 
                 const newPrice = prev + change;
                 
                 return newPrice;
             });
         }
     }, 1000); // Update every second
     return () => clearInterval(interval);
  }, [timeframe, symbol]);


  // --- Drawing Logic (SVG Layer) ---
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);

  const getCoords = (e: React.MouseEvent) => {
      if(!chartContainerRef.current) return { x: 0, y: 0 };
      const rect = chartContainerRef.current.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (activeTool === 'cursor') return;
      // If clicking a toolbar on an object, don't start drawing
      if ((e.target as HTMLElement).closest('.drawing-toolbar')) return;

      setIsDrawing(true);
      const coords = getCoords(e);
      setCurrentDrawing({
          id: Date.now().toString(),
          type: activeTool,
          points: [coords, coords],
          color: '#2962ff'
      });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if(!isDrawing || !currentDrawing) return;
      const coords = getCoords(e);
      setCurrentDrawing(prev => prev ? { ...prev, points: [prev.points[0], coords] } : null);
  };

  const handleMouseUp = () => {
      if(isDrawing && currentDrawing) {
          setDrawings(prev => [...prev, currentDrawing]);
          setIsDrawing(false);
          setCurrentDrawing(null);
      }
  };

  // Select drawing
  const handleDrawingClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSelectedDrawingId(id);
  };
  
  // Delete handler
  const deleteDrawing = (id: string) => {
      setDrawings(prev => prev.filter(d => d.id !== id));
      setSelectedDrawingId(null);
  };
  
  // Render Drawings
  const renderDrawing = (d: Drawing, isSelected: boolean) => {
      if (!d || d.points.length < 2) return null;
      const [p1, p2] = d.points;
      
      // --- PROJECTION TOOLS ---
      if (d.type === 'long_pos' || d.type === 'short_pos') {
          const x = Math.min(p1.x, p2.x);
          const width = Math.abs(p2.x - p1.x);
          const y1 = p1.y; 
          const y2 = p2.y; 
          const dist = Math.abs(y2 - y1); 
          const targetY = d.type === 'long_pos' ? y1 - (dist * 2) : y1 + (dist * 2);
          
          return (
              <g key={d.id} onClick={(e) => handleDrawingClick(e, d.id)} className="cursor-pointer hover:opacity-80">
                  <rect x={x} y={Math.min(y1, y2)} width={width} height={Math.abs(y2 - y1)} fill="rgba(242, 54, 69, 0.2)" stroke="#f23645" />
                  <rect x={x} y={Math.min(y1, targetY)} width={width} height={Math.abs(targetY - y1)} fill="rgba(8, 153, 129, 0.2)" stroke="#089981" />
                  <line x1={x} y1={y1} x2={x+width} y2={y1} stroke="gray" strokeDasharray="4 2" />
                  <text x={x+5} y={y1 - 5} fontSize="10" fill="#089981">Target (2.0)</text>
                  <text x={x+5} y={y1 + 12} fontSize="10" fill="#f23645">Stop</text>
                  {isSelected && <circle cx={p2.x} cy={p2.y} r={4} fill="white" stroke="black" />}
              </g>
          );
      }
      
      if (d.type === 'rect') {
          return (
             <rect 
                key={d.id}
                onClick={(e) => handleDrawingClick(e, d.id)}
                x={Math.min(p1.x, p2.x)}
                y={Math.min(p1.y, p2.y)}
                width={Math.abs(p2.x - p1.x)}
                height={Math.abs(p2.y - p1.y)}
                fill={d.color} fillOpacity={0.2} stroke={d.color} strokeWidth={1.5}
                className="cursor-pointer"
             />
          );
      }
      
      // --- LINE TOOLS (Trend, Ray, etc) ---
      // Ray logic: Extend p2 far out
      let x2 = p2.x;
      let y2 = p2.y;
      if (d.type === 'ray' || d.type === 'extended') {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const length = Math.sqrt(dx*dx + dy*dy);
          if (length > 0) {
              // Extend by 2000px
              x2 = p1.x + (dx / length) * 2000;
              y2 = p1.y + (dy / length) * 2000;
              
              if (d.type === 'extended') {
                  // Also extend backwards
                  // Simplified: just draw ray for now
              }
          }
      }

      return (
          <g key={d.id} onClick={(e) => handleDrawingClick(e, d.id)} className="cursor-pointer group">
            {/* Hit area (thicker invisible line) */}
            <line x1={p1.x} y1={p1.y} x2={x2} y2={y2} stroke="transparent" strokeWidth={10} />
            {/* Visible line */}
            <line x1={p1.x} y1={p1.y} x2={x2} y2={y2} stroke={d.color} strokeWidth={2} />
            
            {isSelected && (
                <>
                    <circle cx={p1.x} cy={p1.y} r={4} fill="white" stroke="#2962ff" />
                    <circle cx={p2.x} cy={p2.y} r={4} fill="white" stroke="#2962ff" />
                </>
            )}
          </g>
      );
  };

  return (
    <div className="flex-1 relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full absolute inset-0 z-0" onClick={() => setSelectedDrawingId(null)} />
      
      {/* Floating Toolbar for Selected Object */}
      {selectedDrawingId && (
          <div 
            className="drawing-toolbar absolute z-50 bg-white shadow-lg border border-tv-border rounded-md p-1 flex gap-1"
            style={{ 
                left: drawings.find(d => d.id === selectedDrawingId)?.points[1].x ?? 100, 
                top: (drawings.find(d => d.id === selectedDrawingId)?.points[1].y ?? 100) - 40 
            }}
          >
              <button className="p-1 hover:bg-gray-100 rounded"><div className="w-4 h-4 bg-blue-600 rounded-full"></div></button>
              <button className="p-1 hover:bg-gray-100 rounded"><div className="w-4 h-1 bg-black"></div></button>
              <button className="p-1 hover:bg-gray-100 rounded"><Lock size={14} /></button>
              <div className="w-px bg-gray-200 my-0.5"></div>
              <button onClick={() => deleteDrawing(selectedDrawingId)} className="p-1 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14} /></button>
          </div>
      )}

      {/* Legend */}
      <div className="absolute top-2 left-2 z-10 bg-transparent pointer-events-none flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-tv-text flex items-center gap-2">
                {symbol} <span className="text-xs font-normal text-tv-textSec">{timeframe}</span>
            </h1>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-green-100 ${timeframe === '1D' ? 'bg-gray-100' : 'bg-green-50 animate-pulse'}`}>
                <div className={`w-2 h-2 rounded-full ${timeframe === '1D' ? 'bg-gray-400' : 'bg-tv-green'}`}></div>
                <span className={`text-[10px] font-bold ${timeframe === '1D' ? 'text-gray-500' : 'text-tv-green'}`}>{timeframe === '1D' ? 'MARKET OPEN' : 'LIVE'}</span>
            </div>
          </div>
          <div className="flex gap-3 text-xs font-mono mt-1 bg-white/50 backdrop-blur-sm p-1 rounded">
              <span className="text-tv-textSec">O <span className="text-tv-green">{currentPrice.toFixed(5)}</span></span>
              <span className="text-tv-textSec">H <span className="text-tv-green">{(currentPrice * 1.0005).toFixed(5)}</span></span>
              <span className="text-tv-textSec">L <span className="text-tv-green">{(currentPrice * 0.9995).toFixed(5)}</span></span>
              <span className="text-tv-textSec">C <span className="text-tv-green">{currentPrice.toFixed(5)}</span></span>
          </div>
      </div>

      {/* NIBRA TRADES Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none opacity-[0.03]">
         <svg width="400" height="400" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="4" fill="#131722"/>
            <path d="M5 8V20H7.5L10.5 14.5V20H13V8H10.5L7.5 13.5V8H5Z" fill="black"/>
            <path d="M15 8V20H19.5C21.5 20 23 19 23 17C23 15.5 22 14.5 21 14C22 13.5 23 12.5 23 11C23 9 21.5 8 19.5 8H15ZM17.5 10H19.5C20 10 20.5 10.5 20.5 11C20.5 11.5 20 12 19.5 12H17.5V10ZM17.5 16V18H19.5C20 18 20.5 17.5 20.5 17C20.5 16.5 20 16 19.5 16H17.5Z" fill="black"/>
        </svg>
      </div>

      {/* SVG Drawing Layer */}
      <svg 
        className={`absolute inset-0 w-full h-full z-20 ${activeTool !== 'cursor' ? 'cursor-crosshair' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ pointerEvents: activeTool !== 'cursor' ? 'all' : selectedDrawingId ? 'all' : 'none' }}
      >
         {[...drawings, currentDrawing].map(d => d ? renderDrawing(d, selectedDrawingId === d.id) : null)}
      </svg>
    </div>
  );
};

export default ChartArea;
