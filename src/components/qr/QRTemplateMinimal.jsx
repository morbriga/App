import React from 'react';

export default function QRTemplateMinimal({ event, qrData }) {
  return (
    <div className="bg-white p-4 sm:p-10 min-h-[600px] flex flex-col justify-between">
      {/* הוספת הגופנים דרך style tag */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:wght@400;700&display=swap');
      `}</style>
      
      <div className="text-center mb-4">
        <h1 className="text-4xl sm:text-6xl mb-2" style={{ fontFamily: "'Great Vibes', cursive" }}>Welcome</h1>
        <p className="text-base sm:text-lg text-gray-600 mb-2 text-right">המסיבה של</p>
        <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-right" style={{ fontFamily: "'Playfair Display', serif" }}>{event.title}</h2>
      </div>
      
      <div className="text-center mb-4 sm:mb-8">
        <h3 className="text-2xl sm:text-3xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>SCAN</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-right">לשיתוף תמונות וסרטונים</p>
        
        <div className="mx-auto w-48 h-48 sm:w-60 sm:h-60 mb-4 sm:mb-8">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(qrData)}`}
            alt="QR Code"
            className="w-full h-full"
            crossOrigin="anonymous"
          />
        </div>
      </div>
      
      <div className="text-center text-gray-500 text-xs sm:text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
        BeventX
      </div>
    </div>
  );
}