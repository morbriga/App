import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

export default function PricingSection({ onGetStarted }) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Basic Plan */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6 border-b">
          <h3 className="text-2xl font-bold mb-2">בסיסי</h3>
          <p className="text-gray-500 mb-4">מתאים לאירועים קטנים ומשפחתיים</p>
          <div className="flex items-baseline mb-2">
            <span className="text-4xl font-extrabold">₪199</span>
            <span className="text-gray-500 mr-2">חד פעמי</span>
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>עד 300 תמונות</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>עד 20 וידאו</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>שמירת תמונות למשך 3 חודשים</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>אתר אירוע לשיתוף</span>
            </li>
            <li className="flex items-start gap-2 text-gray-400">
              <CheckCircle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
              <span>ללא זיהוי פנים אוטומטי</span>
            </li>
          </ul>
          <Button className="w-full bg-accent hover:bg-accent-dark" onClick={onGetStarted}>בחר חבילה</Button>
        </div>
      </div>
      
      {/* Premium Plan */}
      <div className="bg-white rounded-xl border-2 border-primary shadow-lg overflow-hidden transform md:scale-105 relative">
        <div className="absolute top-0 right-0 left-0 bg-primary text-white text-center py-1 text-sm font-medium">
          המומלץ ביותר
        </div>
        <div className="p-6 border-b pt-8">
          <h3 className="text-2xl font-bold mb-2">פרימיום</h3>
          <p className="text-gray-500 mb-4">מתאים לאירועים בינוניים וגדולים</p>
          <div className="flex items-baseline mb-2">
            <span className="text-4xl font-extrabold">₪399</span>
            <span className="text-gray-500 mr-2">חד פעמי</span>
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>תמונות ללא הגבלה</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>עד 50 וידאו</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>שמירת תמונות למשך שנה</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>אתר אירוע מותאם אישית</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>זיהוי פנים בסיסי</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>עריכה אוטומטית של רגעים נבחרים</span>
            </li>
          </ul>
          <Button className="w-full bg-primary hover:bg-primary-dark" onClick={onGetStarted}>בחר חבילה</Button>
        </div>
      </div>
      
      {/* Ultimate Plan */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6 border-b">
          <h3 className="text-2xl font-bold mb-2">אולטימייט</h3>
          <p className="text-gray-500 mb-4">מתאים לחתונות ואירועים גדולים</p>
          <div className="flex items-baseline mb-2">
            <span className="text-4xl font-extrabold">₪699</span>
            <span className="text-gray-500 mr-2">חד פעמי</span>
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>מדיה ללא הגבלה</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>שמירת תמונות ללא הגבלת זמן</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>אתר אירוע מותאם אישית מלא</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>זיהוי פנים מתקדם</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>עריכה אוטומטית מתקדמת</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>ספר אירועים מודפס (50 עמודים)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>תמיכה טכנית ביום האירוע</span>
            </li>
          </ul>
          <Button className="w-full bg-accent hover:bg-accent-dark" onClick={onGetStarted}>בחר חבילה</Button>
        </div>
      </div>
    </div>
  );
}