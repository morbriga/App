import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, PaletteIcon, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

// Background options
const BACKGROUNDS = [
  { id: 'gradient-1', style: 'bg-gradient-to-br from-purple-600 to-blue-500', textColor: 'text-white' },
  { id: 'gradient-2', style: 'bg-gradient-to-br from-pink-500 to-orange-500', textColor: 'text-white' },
  { id: 'gradient-3', style: 'bg-gradient-to-br from-green-500 to-teal-400', textColor: 'text-white' },
  { id: 'solid-1', style: 'bg-black', textColor: 'text-white' },
  { id: 'solid-2', style: 'bg-white', textColor: 'text-black' },
  { id: 'solid-3', style: 'bg-pink-500', textColor: 'text-white' },
  { id: 'solid-4', style: 'bg-blue-500', textColor: 'text-white' },
  { id: 'solid-5', style: 'bg-yellow-400', textColor: 'text-black' },
];

// Font size options
const FONT_SIZES = [
  { id: 'small', class: 'text-2xl' },
  { id: 'medium', class: 'text-3xl' },
  { id: 'large', class: 'text-4xl' }
];

export default function TextPostCreator({ onSave, onCancel }) {
  const [text, setText] = useState('');
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [fontSize, setFontSize] = useState(FONT_SIZES[1]);
  const [textAlign, setTextAlign] = useState('text-center');
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  
  const handleSave = () => {
    if (!text.trim()) return;
    
    onSave({
      text,
      background: background.id,
      fontSize: fontSize.id,
      textAlign
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <button 
          className="w-10 h-10 flex items-center justify-center text-white"
          onClick={onCancel}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <h2 className="text-white text-lg font-medium">יצירת ברכה</h2>
        
        <button
          className="w-10 h-10 flex items-center justify-center"
          onClick={() => setShowBackgrounds(!showBackgrounds)}
        >
          <PaletteIcon className="w-6 h-6 text-white" />
        </button>
      </div>
      
      {/* Post Preview */}
      <div className={`flex-1 flex items-center justify-center p-6 ${background.style}`}>
        <Textarea
          value={text}
          onChange={handleTextChange}
          placeholder="כתוב משהו נחמד..."
          className={`bg-transparent border-none focus-visible:ring-0 resize-none w-full h-full ${background.textColor} ${fontSize.class} ${textAlign}`}
          style={{ 
            textShadow: background.textColor === 'text-white' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
          }}
        />
      </div>
      
      {/* Font controls */}
      {!showBackgrounds ? (
        <div className="p-4 bg-black flex justify-between items-center">
          <div className="flex space-x-4">
            <button 
              className={`w-10 h-10 flex items-center justify-center rounded-full ${fontSize.id === 'small' ? 'bg-gray-700' : 'bg-gray-900'}`}
              onClick={() => setFontSize(FONT_SIZES[0])}
            >
              <Type className="w-4 h-4 text-white" />
            </button>
            <button 
              className={`w-10 h-10 flex items-center justify-center rounded-full ${fontSize.id === 'medium' ? 'bg-gray-700' : 'bg-gray-900'}`}
              onClick={() => setFontSize(FONT_SIZES[1])}
            >
              <Type className="w-5 h-5 text-white" />
            </button>
            <button 
              className={`w-10 h-10 flex items-center justify-center rounded-full ${fontSize.id === 'large' ? 'bg-gray-700' : 'bg-gray-900'}`}
              onClick={() => setFontSize(FONT_SIZES[2])}
            >
              <Type className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <div className="flex space-x-4">
            <button 
              className={`w-10 h-10 flex items-center justify-center rounded-full ${textAlign === 'text-right' ? 'bg-gray-700' : 'bg-gray-900'}`}
              onClick={() => setTextAlign('text-right')}
            >
              <AlignRight className="w-5 h-5 text-white" />
            </button>
            <button 
              className={`w-10 h-10 flex items-center justify-center rounded-full ${textAlign === 'text-center' ? 'bg-gray-700' : 'bg-gray-900'}`}
              onClick={() => setTextAlign('text-center')}
            >
              <AlignCenter className="w-5 h-5 text-white" />
            </button>
            <button 
              className={`w-10 h-10 flex items-center justify-center rounded-full ${textAlign === 'text-left' ? 'bg-gray-700' : 'bg-gray-900'}`}
              onClick={() => setTextAlign('text-left')}
            >
              <AlignLeft className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-black">
          <div className="grid grid-cols-4 gap-4">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                className={`w-16 h-16 rounded-lg overflow-hidden ${bg.style} ${background.id === bg.id ? 'ring-2 ring-white' : ''}`}
                onClick={() => setBackground(bg)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="p-4 bg-black border-t border-gray-800">
        <button
          className={`w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium ${!text.trim() ? 'opacity-50' : ''}`}
          onClick={handleSave}
          disabled={!text.trim()}
        >
          שיתוף
        </button>
      </div>
    </div>
  );
}