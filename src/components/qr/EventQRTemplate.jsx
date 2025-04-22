import React from 'react';
import { format } from 'date-fns';
import Logo from '../Logo';

export default function EventQRTemplate({ event, qrCodeUrl }) {
  const getEventTypeText = (type) => {
    const types = {
      'wedding': 'החתונה של',
      'bar_mitzvah': 'בר המצווה של',
      'bat_mitzvah': 'בת המצווה של',
      'brit': 'ברית ל',
      'corporate': 'אירוע של',
      'birthday': 'יום ההולדת של',
      'party': 'המסיבה של',
      'other': 'האירוע של'
    };
    return types[type] || 'האירוע של';
  };

  // מפשט לשימוש בתמונת QR רגילה במקום לייצר אותה
  const renderQRCode = () => {
    return (
      <div className="flex items-center justify-center">
        <img
          src={qrCodeUrl}
          alt="QR Code"
          className="w-48 h-48"
          crossOrigin="anonymous"
          style={{display: "block"}}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML += '<div class="w-48 h-48 border-2 border-gray-300 flex items-center justify-center">QR Code</div>';
          }}
        />
      </div>
    );
  };

  return (
    <div 
      className="relative w-[420px] bg-white p-12"
      style={{ 
        fontFamily: "'Playfair Display', serif"
      }}
    >
      {/* Header - יישור לשמאל/ימין */}
      <div className="text-left rtl:text-right mb-8">
        <h2 
          className="text-5xl mb-6" 
          style={{ fontFamily: "'Great Vibes', cursive" }}
        >
          Welcome
        </h2>
        
        <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">
          {getEventTypeText(event.type)}
        </p>
        
        <h1 className="text-2xl uppercase tracking-wide font-bold mb-8">
          {event.title}
        </h1>
        
        <p className="uppercase text-sm tracking-wide mb-1">SCAN</p>
        <p className="text-xs text-gray-500">לשיתוף תמונות וסרטונים</p>
      </div>

      {/* QR Code */}
      <div className="mb-12">
        {renderQRCode()}
      </div>

      {/* Logo at bottom */}
      <div className="absolute bottom-8 left-12 opacity-80">
        <div className="flex items-center gap-2">
          <Logo className="w-6 h-6" />
          <span className="text-sm font-light tracking-wider text-gray-600">
            BeventX
          </span>
        </div>
      </div>
    </div>
  );
}