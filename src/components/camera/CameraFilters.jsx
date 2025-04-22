import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

const FILTERS = [
  { id: null, name: 'ללא', preview: 'https://i.imgur.com/ZoVlYzR.jpg' },
  { id: 'sepia(0.8)', name: 'חתונה', preview: 'https://i.imgur.com/ZoVlYzR.jpg' },
  { id: 'grayscale(1)', name: 'שחור לבן', preview: 'https://i.imgur.com/ZoVlYzR.jpg' },
  { id: 'brightness(1.2) contrast(1.2)', name: 'בהיר', preview: 'https://i.imgur.com/ZoVlYzR.jpg' },
  { id: 'hue-rotate(90deg)', name: 'צבעוני', preview: 'https://i.imgur.com/ZoVlYzR.jpg' },
  { id: 'invert(0.8)', name: 'הפוך', preview: 'https://i.imgur.com/ZoVlYzR.jpg' },
  { id: 'blur(2px) brightness(1.1)', name: 'רך', preview: 'https://i.imgur.com/ZoVlYzR.jpg' },
  { id: 'contrast(1.4) saturate(1.8)', name: 'חי', preview: 'https://i.imgur.com/ZoVlYzR.jpg' }
];

export default function CameraFilters({ activeFilter, onSelectFilter }) {
  return (
    <div className="bg-black/40 backdrop-blur-md py-3">
      <ScrollArea orientation="horizontal" className="w-full">
        <div className="flex px-4 space-x-4 min-w-max">
          {FILTERS.map((filter) => (
            <div 
              key={filter.id || 'normal'} 
              className="flex flex-col items-center space-y-2"
              onClick={() => onSelectFilter(filter.id)}
            >
              <div 
                className={`w-16 h-16 rounded-full overflow-hidden border-2 ${activeFilter === filter.id ? 'border-purple-500' : 'border-transparent'}`}
              >
                <img 
                  src={filter.preview} 
                  alt={filter.name}
                  className="w-full h-full object-cover"
                  style={{ filter: filter.id }}
                />
              </div>
              <span className="text-white text-xs">{filter.name}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}