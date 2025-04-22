import React, { useState, useEffect } from 'react';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Mail,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { User } from '@/api/entities';
import { PaymentTransaction } from '@/api/entities';
import { useAdminData } from '../components/admin/DataProvider';

export default function AdminPayments() {
  const { payments, loadPayments } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const currentUser = await User.me();
        if (!currentUser?.is_admin) {
          window.location.href = createPageUrl('Home');
          return;
        }
        
        // טעינת נתוני תשלומים
        loadPayments();
      } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = createPageUrl('Home');
      }
    };
    
    checkAdminAccess();
  }, [loadPayments]);
  
  const handleApprovePayment = (payment) => {
    setSelectedPayment(payment);
    setShowApproveModal(true);
  };
  
  const handleRejectPayment = (payment) => {
    setSelectedPayment(payment);
    setShowRejectModal(true);
  };
  
  const confirmApproval = async () => {
    try {
      // עדכון סטטוס התשלום ל-'approved'
      await PaymentTransaction.update(selectedPayment.id, {
        ...selectedPayment,
        status: 'approved'
      });
      
      // רענון רשימת התשלומים
      await loadPayments();
      
      setShowApproveModal(false);
      alert('התשלום אושר בהצלחה!');
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('אירעה שגיאה באישור התשלום');
    }
  };
  
  const confirmRejection = async () => {
    if (!rejectReason) {
      alert('נא להזין סיבת דחייה');
      return;
    }
    
    try {
      // עדכון סטטוס התשלום ל-'rejected'
      await PaymentTransaction.update(selectedPayment.id, {
        ...selectedPayment,
        status: 'rejected',
        refund_data: {
          refund_date: new Date().toISOString(),
          refund_reason: rejectReason
        }
      });
      
      // רענון רשימת התשלומים
      await loadPayments();
      
      setShowRejectModal(false);
      setRejectReason('');
      alert('התשלום נדחה!');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('אירעה שגיאה בדחיית התשלום');
    }
  };
  
  const filteredPayments = payments.data.filter(payment => {
    // סינון לפי סטטוס
    if (activeFilter !== 'all' && payment.status !== activeFilter) {
      return false;
    }
    
    // סינון לפי חיפוש
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (payment.user_email && payment.user_email.toLowerCase().includes(query)) ||
        (payment.transaction_id && payment.transaction_id.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // חישוב סטטיסטיקות
  const stats = {
    totalPayments: payments.data.length,
    pendingPayments: payments.data.filter(p => p.status === 'pending').length,
    approvedPayments: payments.data.filter(p => p.status === 'approved').length,
    rejectedPayments: payments.data.filter(p => p.status === 'rejected').length,
    totalRevenue: payments.data
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0)
  };
  
  if (payments.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-700 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">ניהול תשלומים</h1>
            <p className="text-gray-600">ניהול ומעקב אחר תשלומי לקוחות</p>
          </div>
          
          <Button 
            onClick={() => loadPayments()} 
            variant="outline" 
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            רענן נתונים
          </Button>
        </div>
        
        {/*  כרטיסי סטטיסטיקה */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="סה״כ תשלומים"
            value={stats.totalPayments}
            icon={<Download className="h-5 w-5 text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <StatCard 
            title="ממתינים לאישור"
            value={stats.pendingPayments}
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            bgColor="bg-amber-50"
          />
          <StatCard 
            title="תשלומים שאושרו"
            value={stats.approvedPayments}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            bgColor="bg-green-50"
          />
          <StatCard 
            title="הכנסות"
            value={`₪${stats.totalRevenue.toLocaleString()}`}
            icon={<Download className="h-5 w-5 text-indigo-600" />}
            bgColor="bg-indigo-50"
          />
        </div>
        
        {/*  פילטרים וחיפוש */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="חפש לפי אימייל או מזהה עסקה..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Tabs value={activeFilter} onValueChange={setActiveFilter}>
              <TabsList>
                <TabsTrigger value="all">הכל ({stats.totalPayments})</TabsTrigger>
                <TabsTrigger value="pending">ממתין ({stats.pendingPayments})</TabsTrigger>
                <TabsTrigger value="approved">אושר ({stats.approvedPayments})</TabsTrigger>
                <TabsTrigger value="rejected">נדחה ({stats.rejectedPayments})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* הודעת שגיאה */}
        {payments.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            <p className="font-medium">שגיאה בטעינת נתוני תשלומים:</p>
            <p>{payments.error}</p>
          </div>
        )}
        
        {/*  טבלת תשלומים */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-0">
            <CardTitle>רשימת תשלומים</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>תאריך</TableHead>
                  <TableHead>משתמש</TableHead>
                  <TableHead>מזהה עסקה</TableHead>
                  <TableHead>סכום</TableHead>
                  <TableHead>אמצעי תשלום</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center text-gray-500">
                        <Search className="h-10 w-10 mb-2" />
                        <p className="font-medium">לא נמצאו תוצאות</p>
                        <p className="text-sm">נסה לשנות את החיפוש או הפילטר</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {format(new Date(payment.created_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs text-gray-500">{payment.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{payment.transaction_id}</TableCell>
                      <TableCell className="font-semibold">₪{payment.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          payment.payment_method === 'bit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          payment.payment_method === 'credit_card' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }>
                          {payment.payment_method === 'bit' ? 'ביט' :
                           payment.payment_method === 'credit_card' ? 'כרטיס אשראי' : 'PayPal'}
                        </Badge>
                        {payment.payment_details?.card_last_digits && (
                          <p className="text-xs text-gray-500 mt-1">
                            סיומת: {payment.payment_details.card_last_digits}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          payment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {payment.status === 'pending' ? 'ממתין לאישור' :
                           payment.status === 'approved' ? 'אושר' : 'נדחה'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => {
                              alert(`
פרטי תשלום:
מזהה: ${payment.id}
משתמש: ${payment.user_email}
סכום: ₪${payment.amount}
אמצעי תשלום: ${payment.payment_method}
מזהה עסקה: ${payment.transaction_id}
סטטוס: ${payment.status}
${payment.refund_data?.refund_reason ? 'סיבת דחייה: ' + payment.refund_data.refund_reason : ''}
                              `);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {payment.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprovePayment(payment)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRejectPayment(payment)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          {payment.status === 'approved' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/*  מודל אישור תשלום */}
        {showApproveModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">אישור תשלום</h3>
              <p className="mb-6">
                האם אתה בטוח שברצונך לאשר את התשלום של 
                <span className="font-semibold"> {selectedPayment.user_email} </span>
                על סך 
                <span className="font-semibold"> ₪{selectedPayment.amount}</span>
                ?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">פרטי התשלום:</p>
                <ul className="mt-2 space-y-1">
                  <li className="text-sm">סכום: <span className="font-medium">₪{selectedPayment.amount}</span></li>
                  <li className="text-sm">אמצעי תשלום: <span className="font-medium">
                    {selectedPayment.payment_method === 'bit' ? 'ביט' :
                     selectedPayment.payment_method === 'credit_card' ? 'כרטיס אשראי' : 'PayPal'}
                  </span></li>
                  <li className="text-sm">מזהה עסקה: <span className="font-medium">{selectedPayment.transaction_id}</span></li>
                </ul>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowApproveModal(false)}
                >
                  ביטול
                </Button>
                <Button 
                  onClick={confirmApproval}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  אשר תשלום
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/*  מודל דחיית תשלום */}
        {showRejectModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">דחיית תשלום</h3>
              <p className="mb-4">
                אנא ציין את הסיבה לדחיית התשלום של 
                <span className="font-semibold"> {selectedPayment.user_email}</span>:
              </p>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="סיבת הדחייה..."
                className="mb-6"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                >
                  ביטול
                </Button>
                <Button 
                  onClick={confirmRejection}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={!rejectReason}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  דחה תשלום
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgColor }) {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`${bgColor} p-2 rounded-full`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}