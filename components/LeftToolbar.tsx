
import React, { useState, useEffect } from 'react';
import { 
    MousePointer2, TrendingUp, BoxSelect, Type, Percent, Magnet, 
    ZoomIn, Eraser, Lock, Eye, Trash2, Ruler, ArrowUpRight, MoveRight, 
    Info, Minus, Spline, Circle, Triangle, MessageSquare,
    CandlestickChart, BarChart3
} from 'lucide-react';
import { DrawingTool, ToolGroup } from '../types';

interface LeftToolbarProps {
  activeTool: DrawingTool;
  setActiveTool: (tool: DrawingTool) => void;
  onClearDrawings: () => void;
}

// Helper to render icon
const renderIcon = (id: string, size = 20) => {
    const props = { size, strokeWidth: 1.5 };
    switch(id) {
        case 'cursor': return <MousePointer2 {...props} />;
        case 'trendline': return <TrendingUp {...props} />;
        case 'ray': return <ArrowUpRight {...props} />;
        case 'info_line': return <Info {...props} />;
        case 'extended': return <MoveRight {...props} />;
        case 'fib_retracement': return <Percent {...props} />;
        case 'fib_extension': return <Spline {...props} />;
        case 'rect': return <BoxSelect {...props} />;
        case 'circle': return <Circle {...props} />;
        case 'triangle': return <Triangle {...props} />;
        case 'text': return <Type {...props} />;
        case 'callout': return <MessageSquare {...props} />;
        case 'long_pos': return <ArrowUpRight className="text-tv-green" {...props} />;
        case 'short_pos': return <ArrowUpRight className="text-tv-red rotate-180" {...props} />;
        case 'price_range': return <Ruler {...props} />;
        default: return <TrendingUp {...props} />;
    }
};

const TOOL_GROUPS: ToolGroup[] = [
    {
        id: 'cursor',
        icon: <MousePointer2 />,
        items: [{ id: 'cursor', label: 'Crosshair' }]
    },
    {
        id: 'lines',
        icon: <TrendingUp />,
        items: [
            { id: 'trendline', label: 'Trend Line' },
            { id: 'ray', label: 'Ray' },
            { id: 'info_line', label: 'Info Line' },
            { id: 'extended', label: 'Extended Line' }
        ]
    },
    {
        id: 'fibs',
        icon: <Percent />,
        items: [
            { id: 'fib_retracement', label: 'Fib Retracement' },
            { id: 'fib_extension', label: 'Trend-Based Fib Extension' }
        ]
    },
    {
        id: 'shapes',
        icon: <BoxSelect />,
        items: [
            { id: 'rect', label: 'Rectangle' },
            { id: 'circle', label: 'Circle' },
            { id: 'triangle', label: 'Triangle' }
        ]
    },
    {
        id: 'text',
        icon: <Type />,
        items: [
            { id: 'text', label: 'Text' },
            { id: 'callout', label: 'Callout' }
        ]
    },
    {
        id: 'prediction',
        icon: <BarChart3 />,
        items: [
            { id: 'long_pos', label: 'Long Position' },
            { id: 'short_pos', label: 'Short Position' },
            { id: 'price_range', label: 'Price Range' }
        ]
    }
];

const LeftToolbar: React.FC<LeftToolbarProps> = ({ activeTool, setActiveTool, onClearDrawings }) => {
  const [activePopover, setActivePopover] = useState<string | null>(null);

  useEffect(() => {
      const handleClickOutside = () => setActivePopover(null);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleToolClick = (e: React.MouseEvent, group: ToolGroup) => {
      e.stopPropagation();
      // If group only has 1 item
      if(group.items.length === 1) {
          setActiveTool(group.items[0].id);
          setActivePopover(null);
          return;
      }

      // If user clicks main button and an item in this group is ALREADY active, 
      // it effectively does nothing (keeps tool active). 
      // If user clicks main button and tool is NOT active, select the first one.
      // BUT, we also want to toggle popover if clicking the arrow...
      // Simplified: Click main button = select first item (or currently active item in that group)
      
      const itemInGroup = group.items.find(i => i.id === activeTool);
      if (itemInGroup) {
          // Already active in this group, toggle popover
          setActivePopover(activePopover === group.id ? null : group.id);
      } else {
          // Activate first item
          setActiveTool(group.items[0].id);
      }
  };

  const getActiveIconForGroup = (group: ToolGroup) => {
      const activeItem = group.items.find(i => i.id === activeTool);
      if (activeItem) return renderIcon(activeItem.id);
      return renderIcon(group.items[0].id); // Default to first item
  };

  return (
    <aside className="w-[52px] bg-white border-r border-tv-border flex flex-col items-center py-3 gap-1 z-40 select-none shadow-sm relative">
      
      {TOOL_GROUPS.map((group) => (
          <div key={group.id} className="relative w-full flex justify-center">
              <div className="relative group flex items-center justify-center w-full px-1">
                <button 
                  onClick={(e) => handleToolClick(e, group)}
                  className={`w-9 h-9 flex items-center justify-center rounded hover:bg-tv-gray transition-colors relative ${group.items.some(i => i.id === activeTool) ? 'text-tv-blue bg-blue-50' : 'text-tv-text'}`}
                >
                  {getActiveIconForGroup(group)}
                  
                  {group.items.length > 1 && (
                      <div 
                        className="absolute bottom-0 right-0 w-2 h-2 flex items-end justify-end p-0.5 cursor-pointer hover:bg-gray-200 rounded-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActivePopover(activePopover === group.id ? null : group.id);
                        }}
                      >
                          <svg viewBox="0 0 6 6" fill="currentColor" className="w-1.5 h-1.5"><path d="M3 6L0 0H6L3 6Z" /></svg>
                      </div>
                  )}
                </button>
              </div>

              {/* Flyout Menu */}
              {activePopover === group.id && group.items.length > 1 && (
                  <div className="absolute left-full top-0 ml-2 bg-white border border-tv-border shadow-xl rounded py-1 z-50 min-w-[180px] flex flex-col animate-in fade-in zoom-in-95 duration-100">
                      {group.items.map(item => (
                          <button 
                            key={item.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveTool(item.id);
                                setActivePopover(null);
                            }}
                            className={`text-left px-4 py-2 text-sm hover:bg-tv-gray flex items-center gap-3 ${activeTool === item.id ? 'text-tv-blue bg-blue-50' : 'text-tv-text'}`}
                          >
                              {renderIcon(item.id, 16)}
                              {item.label}
                          </button>
                      ))}
                  </div>
              )}
          </div>
      ))}

      <div className="w-6 h-[1px] bg-tv-border my-2"></div>
      
      <div className="flex flex-col gap-1 w-full px-1">
        <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-tv-gray text-tv-text mx-auto" title="Measure"><Ruler size={20} strokeWidth={1.5} /></button>
        <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-tv-gray text-tv-text mx-auto" title="Zoom In"><ZoomIn size={20} strokeWidth={1.5} /></button>
        <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-tv-gray text-tv-text mx-auto" title="Magnet Mode"><Magnet size={20} strokeWidth={1.5} /></button>
        <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-tv-gray text-tv-text mx-auto" title="Lock All"><Lock size={20} strokeWidth={1.5} /></button>
        <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-tv-gray text-tv-text mx-auto" title="Hide All"><Eye size={20} strokeWidth={1.5} /></button>
      </div>
      
      <div className="flex-1"></div>
      
      <button 
        onClick={onClearDrawings}
        className="w-9 h-9 flex items-center justify-center rounded hover:bg-tv-gray text-tv-text mb-2"
        title="Remove Objects"
      >
        <Trash2 size={20} strokeWidth={1.5} />
      </button>
    </aside>
  );
};

export default LeftToolbar;
