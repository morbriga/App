
import React, { useState, useEffect } from 'react';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Calendar, KeyRound, User, ChevronLeft, CheckCircle, ChevronsUpDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SendEmail } from '@/components/services/EmailService';

const BANK_DETAILS = {
  accountName: "BeventX",
  bankNumber: "12",
  branchNumber: "123",
  accountNumber: "123456",
  bitPhone: "050-1234567"
};

export default function Payment() {
  const [plan, setPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [bitQrVisible, setBitQrVisible] = useState(false);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [bitPaymentDetails, setBitPaymentDetails] = useState({
    transactionId: '',
    amount: 0,
    lastDigits: ''
  });
    const [showWaitingMessage, setShowWaitingMessage] = useState(false);
    const [currentUser, setCurrentUser] = useState({
        full_name: "ישראל ישראלי",
        email: "test@test.com"
    });
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan') || 'premium';
    
    const plans = {
      basic: { name: 'בסיסי', price: 199 },
      premium: { name: 'פרימיום', price: 399 },
      ultimate: { name: 'אולטימייט', price: 699 }
    };
    
    setPlan(plans[planId]);
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardNumber: formattedValue
    }));
  };
  
  const handlePayPalPayment = () => {
    // In a real implementation, this would redirect to PayPal
    window.open('https://www.paypal.com', '_blank');
    
    // For demo purposes, we'll simulate a successful payment
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
      
      // Redirect to create event after 2 seconds
      setTimeout(() => {
        window.location.href = createPageUrl('CreateEvent');
      }, 2000);
    }, 1500);
  };
  
  const handleBitPayment = () => {
    setBitQrVisible(!bitQrVisible);
  };
    const handleBitPaymentSubmit = async () => {
        if (!bitPaymentDetails.transactionId || !bitPaymentDetails.amount || !bitPaymentDetails.lastDigits) {
            alert('נא למלא את כל פרטי התשלום');
            return;
        }

        setLoading(true);

        try {
            // שמירת פרטי התשלום במערכת
            // await Event.create({
            //     ...formData,
            //     payment_status: 'pending',
            //     payment_method: 'bit',
            //     payment_details: bitPaymentDetails
            // });

            // שליחת מייל למנהל המערכת
             await SendEmail({
                 to: "admin@beventx.com",
                 subject: "תשלום ביט חדש ממתין לאישור",
                 body: `
               פרטי התשלום:
               סכום: ${bitPaymentDetails.amount}
               מזהה עסקה: ${bitPaymentDetails.transactionId}
               4 ספרות אחרונות: ${bitPaymentDetails.lastDigits}

               פרטי הלקוח:
               שם: ${currentUser.full_name}
               מייל: ${currentUser.email}

               לאישור התשלום: [קישור למערכת ניהול]
             `
             });

            // הצגת הודעת המתנה ללקוח
            setShowWaitingMessage(true);

        } catch (error) {
            console.error('Error processing bit payment:', error);
            alert('אירעה שגיאה בשמירת פרטי התשלום');
        } finally {
            setLoading(false);
        }
    };

    const renderBitPayment = () => (
        <div className="space-y-6">
            <div className="bg-violet-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4">פרטי חשבון להעברה בביט:</h3>
                <div className="space-y-2 text-gray-600">
                    <p>מספר טלפון לביט: {BANK_DETAILS.bitPhone}</p>
                    <p>על שם: {BANK_DETAILS.accountName}</p>
                    <p className="text-sm text-gray-500">* נא לשמור את אישור ההעברה</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <Label>סכום ששולם</Label>
                    <Input
                        type="number"
                        value={bitPaymentDetails.amount}
                        onChange={(e) => setBitPaymentDetails(prev => ({
                            ...prev,
                            amount: e.target.value
                        }))}
                        placeholder="הזן את הסכום ששילמת"
                    />
                </div>

                <div>
                    <Label>מזהה העברה (מופיע באישור התשלום)</Label>
                    <Input
                        value={bitPaymentDetails.transactionId}
                        onChange={(e) => setBitPaymentDetails(prev => ({
                            ...prev,
                            transactionId: e.target.value
                        }))}
                        placeholder="לדוגמה: BIT-123456"
                    />
                </div>

                <div>
                    <Label>4 ספרות אחרונות של הטלפון ממנו בוצע התשלום</Label>
                    <Input
                        maxLength="4"
                        value={bitPaymentDetails.lastDigits}
                        onChange={(e) => setBitPaymentDetails(prev => ({
                            ...prev,
                            lastDigits: e.target.value
                        }))}
                        placeholder="לדוגמה: 1234"
                    />
                </div>
            </div>

            <Button
                onClick={handleBitPaymentSubmit}
                className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        מעבד תשלום...
                    </>
                ) : (
                    <>
                        אשר תשלום
                        <ChevronLeft className="w-5 h-5" />
                    </>
                )}
            </Button>

            {showWaitingMessage && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">התשלום בבדיקה</h4>
                    <p className="text-sm text-yellow-700">
                        פרטי התשלום התקבלו ונמצאים בבדיקה.
                        נשלח לך מייל ברגע שהתשלום יאושר ותוכל להתחיל להשתמש במערכת.
                    </p>
                </div>
            )}
        </div>
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    
    // Simulate payment process
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
      
      // Redirect to create event after 2 seconds
      setTimeout(() => {
        window.location.href = createPageUrl('CreateEvent');
      }, 2000);
    }, 1500);
  };
  
  if (!plan) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }
  
  if (completed) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">התשלום בוצע בהצלחה!</CardTitle>
            <CardDescription>
              מיד תועברו ליצירת האירוע שלכם
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">השלמת הזמנה</h1>
          <p className="text-gray-600 mt-2">רכישת חבילת {plan.name}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>פרטי תשלום</CardTitle>
                <CardDescription>
                  אנא הזינו את פרטי התשלום שלכם להשלמת ההזמנה
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="creditCard" onValueChange={setPaymentMethod}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="creditCard">כרטיס אשראי</TabsTrigger>
                    <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    <TabsTrigger value="bit">ביט</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="creditCard">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardName">שם בעל הכרטיס</Label>
                          <div className="relative">
                            <Input
                              id="cardName"
                              name="cardName"
                              placeholder="ישראל ישראלי"
                              value={formData.cardName}
                              onChange={handleInputChange}
                              className="pl-10"
                              required
                            />
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">מספר כרטיס</Label>
                          <div className="relative">
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={formData.cardNumber}
                              onChange={handleCardNumberChange}
                              className="pl-10"
                              maxLength="19"
                              required
                            />
                            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">תאריך תפוגה</Label>
                            <div className="relative">
                              <Input
                                id="expiryDate"
                                name="expiryDate"
                                placeholder="MM/YY"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                className="pl-10"
                                required
                              />
                              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <div className="relative">
                              <Input
                                id="cvv"
                                name="cvv"
                                type="password"
                                placeholder="123"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                className="pl-10"
                                maxLength="4"
                                required
                              />
                              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="paypal">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-20 h-20 mb-4">
                        <img 
                          src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
                          alt="PayPal" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-gray-600 mb-6">לחצו על הכפתור למטה להמשך התשלום דרך PayPal</p>
                      <Button
                        onClick={handlePayPalPayment}
                        className="bg-[#0070ba] hover:bg-[#005ea6] text-white w-full"
                      >
                        המשך לתשלום באמצעות PayPal
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="bit">
                    {renderBitPayment()}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>סיכום הזמנה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">חבילת {plan.name}</span>
                    <span>₪{plan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>מע"מ (17%)</span>
                    <span>כלול</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>סה"כ</span>
                  <span>₪{plan.price}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gap-2 bg-green-600 hover:bg-green-700"
                  onClick={paymentMethod === 'creditCard' ? handleSubmit : 
                           paymentMethod === 'paypal' ? handlePayPalPayment : 
                           handleBitPaymentSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      מבצע תשלום...
                    </>
                  ) : (
                    <>
                      בצע תשלום
                      <ChevronLeft className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
