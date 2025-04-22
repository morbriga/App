import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Logo from '../Logo';

export default function BrandedQRCode({ url, size = 512 }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;

    const generateQR = async () => {
      try {
        // יצירת QR קוד בסיסי
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'H' // גבוה יותר מאפשר יותר שטח ללוגו
        });

        // הוספת הלוגו
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // יצירת לוגו זמני
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/76c90c_20250416_1309_PinkIconsTransformation_remix_01jrz12av7fb78b61tx16t88ba.png";
        
        logoImg.onload = () => {
          // גודל הלוגו - 20% מגודל ה-QR
          const logoSize = size * 0.2;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;
          
          // יצירת רקע לבן עגול מאחורי הלוגו
          ctx.beginPath();
          ctx.arc(size/2, size/2, logoSize/1.8, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
          
          // הוספת הלוגו
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        };
      } catch (err) {
        console.error("Error generating QR code:", err);
      }
    };

    generateQR();
  }, [url, size]);

  return <canvas ref={canvasRef} />;
}