import React, { useState, useEffect } from 'react';
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronLeft, Camera, CreditCard, X, Lock } from 'lucide-react';
import { User } from '@/api/entities';
import { UserPlan } from '@/api/entities';
import { Event } from '@/api/entities';

const plans = [
  {
    id: 'basic',
    name: 'בסיסי',
    description: 'מתאים לאירועים קטנים ומשפחתיים',
    price: 199,
    priceDetail: 'חד פעמי',
    features: [
      'עד 300 תמונות',
      'עד 20 וידאו',
      'שמירת תמונות למשך 3 חודשים',
      'אתר אירוע לשיתוף',
      'ללא זיהוי פנים אוטומטי'
    ],
    color: 'blue',
    buttonColor: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    id: 'premium',
    name: 'פרימיום',
    description: 'מתאים לאירועים בינוניים וגדולים',
    price: 399,
    priceDetail: 'חד פעמי',
    features: [
      'עד 1,000 תמונות',
      'עד 50 וידאו',
      'שמירת תמונות למשך שנה',
      'אתר אירוע מותאם אישית',
      'זיהוי פנים בסיסי',
      'עריכה אוטומטית של רגעים נבחרים'
    ],
    color: 'purple',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    recommended: true
  },
  {
    id: 'ultimate',
    name: 'אולטימייט',
    description: 'מתאים לחתונות ואירועים גדולים',
    price: 699,
    priceDetail: 'חד פעמי',
    features: [
      'מדיה ללא הגבלה',
      'שמירת תמונות ללא הגבלת זמן',
      'אתר אירוע מותאם אישית מלא',
      'זיהוי פנים מתקדם',
      'עריכה אוטומטית מתקדמת',
      'ספר אירועים מודפס (50 עמודים)',
      'תמיכה טכנית ביום האירוע'
    ],
    color: 'amber',
    buttonColor: 'bg-amber-600 hover:bg-amber-700'
  }
];

export default function SelectPlan() {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasEvent, setHasEvent] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = await User.me();
        setCurrentUser(user);
        
        // Check if user has an event
        const events = await Event.filter({ owner_email: user.email });
        setHasEvent(events.length > 0);
        
        // In a real implementation, we would fetch the user's current plan
        // const userPlan = await UserPlan.findOne({ user_email: user.email });
        // setCurrentPlan(userPlan);
        // if (userPlan) {
        //   setSelectedPlan(userPlan.plan_type);
        // }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };
  
  const handleContinue = () => {
    // If user already has an event, directly go to payment
    if (hasEvent) {
      window.location.href = createPageUrl('Payment') + `?plan=${selectedPlan}&upgrade=true`;
    } else {
      window.location.href = createPageUrl('Payment') + `?plan=${selectedPlan}`;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <motion.div 
              className="bg-white p-3 rounded-full shadow-md"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Camera className="w-8 h-8 text-purple-600" />
            </motion.div>
          </div>
          <motion.h1 
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {hasEvent ? 'שדרג את חבילת האירוע שלך' : 'בחר את החבילה המתאימה לך'}
          </motion.h1>
          <motion.p 
            className="text-gray-600 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            כל חבילה מעניקה לך חוויה מלאה ומותאמת אישית לאירוע שלך. אנחנו כאן כדי לעזור לך לשמור על הרגעים היפים ביותר.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
            >
              <Card 
                className={`${
                  selectedPlan === plan.id 
                    ? 'border-2 border-' + plan.color + '-500 shadow-xl transform-gpu scale-105'
                    : 'border border-gray-200 transform-gpu transition-all hover:scale-105'
                } overflow-hidden`}
              >
                {plan.recommended && (
                  <div className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 text-sm font-medium`}>
                    המומלץ ביותר
                  </div>
                )}
                <CardHeader className={`${plan.recommended ? 'bg-gradient-to-r from-pink-50 to-purple-50' : 'bg-gray-50'} text-center border-b`}>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₪{plan.price}</span>
                    <span className="text-gray-500 text-sm"> / {plan.priceDetail}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <CheckCircle className={`w-5 h-5 text-${plan.color === 'amber' ? 'yellow' : plan.color}-500 shrink-0 mt-0.5`} />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {currentPlan && currentPlan.plan_type === plan.id ? (
                    <Badge className="w-full bg-green-100 text-green-800 py-2 text-center flex justify-center items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      החבילה הנוכחית שלך
                    </Badge>
                  ) : (
                    <Button 
                      className={`w-full ${
                        selectedPlan === plan.id 
                          ? plan.buttonColor 
                          : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {selectedPlan === plan.id ? 'נבחר' : 'בחר חבילה'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="flex justify-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button 
            onClick={handleContinue}
            size="lg" 
            className="gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-lg px-8 py-7 rounded-xl shadow-lg"
          >
            המשך לתשלום
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}