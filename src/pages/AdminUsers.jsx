import React, { useState, useEffect } from 'react';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Search,
  Plus,
  PencilIcon,
  Trash2,
  MoreHorizontal,
  Shield,
  Check,
  X,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { hasPermission } from '@/components/auth/AdminAuth';
import { User } from '@/api/entities';
import { SystemLog } from '@/api/entities';
import AdminLayout from './AdminLayout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const checkPermissionsAndLoadUsers = async () => {
      try {
        // בדיקת הרשאות
        const hasManagePermission = await hasPermission('manage_users');
        setCanManageUsers(hasManagePermission);
        
        // טעינת משתמשים
        fetchUsers();
      } catch (error) {
        console.error('Error checking permissions:', error);
      }
    };
    
    checkPermissionsAndLoadUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // במערכת אמיתית, נשלח בקשת API לקבלת רשימת המשתמשים
      // לצורך ההדגמה, נשתמש בנתונים פיקטיביים
      
      // רישום פעולת הצפייה במשתמשים
      await SystemLog.create({
        admin_email: 'admin@beventx.com', // בהנחה שזה האימייל של המנהל המחובר
        action_type: 'user_management',
        action_description: 'צפייה ברשימת משתמשים',
        status: 'success'
      });
      
      // דוגמה לנתונים שהיינו מקבלים מהשרת
      setTimeout(() => {
        const mockUsers = [
          {
            id: '1',
            full_name: 'ישראל ישראלי',
            email: 'israel@example.com',
            created_at: '2023-03-15T12:00:00Z',
            status: 'active',
            plan: 'premium',
            events_count: 2,
            profile_image: 'https://randomuser.me/api/portraits/men/32.jpg'
          },
          {
            id: '2',
            full_name: 'רותי כהן',
            email: 'ruth@example.com',
            created_at: '2023-04-10T15:30:00Z',
            status: 'active',
            plan: 'basic',
            events_count: 1,
            profile_image: 'https://randomuser.me/api/portraits/women/44.jpg'
          },
          {
            id: '3',
            full_name: 'דן לוי',
            email: 'dan@example.com',
            created_at: '2023-02-18T09:15:00Z',
            status: 'suspended',
            plan: 'ultimate',
            events_count: 3,
            profile_image: 'https://randomuser.me/api/portraits/men/22.jpg',
            suspension_reason: 'תוכן בלתי הולם'
          },
          {
            id: '4',
            full_name: 'נועה חן',
            email: 'noa@example.com',
            created_at: '2023-05-20T14:45:00Z',
            status: 'active',
            plan: 'free',
            events_count: 0,
            profile_image: 'https://randomuser.me/api/portraits/women/17.jpg'
          },
          {
            id: '5',
            full_name: 'אורי שמואלי',
            email: 'uri@example.com',
            created_at: '2023-01-05T11:20:00Z',
            status: 'inactive',
            plan: 'premium',
            events_count: 1,
            profile_image: 'https://randomuser.me/api/portraits/men/55.jpg',
            last_login: '2023-03-10T08:30:00Z'
          }
        ];
        
        setUsers(mockUsers);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${user.full_name}?`)) {
      try {
        // במערכת אמיתית, נשלח בקשת מחיקה לשרת
        
        // רישום פעולת המחיקה
        await SystemLog.create({
          admin_email: 'admin@beventx.com',
          action_type: 'user_management',
          action_description: `מחיקת משתמש: ${user.email}`,
          target_id: user.id,
          status: 'success'
        });
        
        // מחיקת המשתמש מהרשימה המקומית
        setUsers(users.filter(u => u.id !== user.id));
        
        alert('המשתמש נמחק בהצלחה');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('שגיאה במחיקת המשתמש');
      }
    }
  };

  const handleSuspendUser = async (user) => {
    const reason = prompt('הזן סיבה להשעיית המשתמש:');
    if (reason) {
      try {
        // במערכת אמיתית, נשלח בקשת עדכון לשרת
        
        // רישום פעולת ההשעיה
        await SystemLog.create({
          admin_email: 'admin@beventx.com',
          action_type: 'user_management',
          action_description: `השעיית משתמש: ${user.email}`,
          target_id: user.id,
          additional_data: { reason },
          status: 'success'
        });
        
        // עדכון סטטוס המשתמש ברשימה המקומית
        setUsers(users.map(u => u.id === user.id ? { ...u, status: 'suspended', suspension_reason: reason } : u));
      } catch (error) {
        console.error('Error suspending user:', error);
      }
    }
  };

  const handleActivateUser = async (user) => {
    try {
      // במערכת אמיתית, נשלח בקשת עדכון לשרת
      
      // רישום פעולת ההפעלה
      await SystemLog.create({
        admin_email: 'admin@beventx.com',
        action_type: 'user_management',
        action_description: `הפעלת משתמש: ${user.email}`,
        target_id: user.id,
        status: 'success'
      });
      
      // עדכון סטטוס המשתמש ברשימה המקומית
      setUsers(users.map(u => u.id === user.id ? { ...u, status: 'active', suspension_reason: undefined } : u));
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    // סינון לפי סטטוס
    if (filterStatus !== 'all' && user.status !== filterStatus) {
      return false;
    }
    
    // סינון לפי חיפוש
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.includes(query)
      );
    }
    
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">פעיל</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">מושעה</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">לא פעיל</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'free':
        return <Badge variant="outline" className="bg-gray-50">חינמי</Badge>;
      case 'basic':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">בסיסי</Badge>;
      case 'premium':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">פרימיום</Badge>;
      case 'ultimate':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">אולטימייט</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ניהול משתמשים</h1>
          <p className="text-gray-600">צפייה וניהול משתמשי המערכת</p>
        </div>
        
        {/* פילטרים וחיפוש */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="חפש לפי שם, אימייל או מזהה..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setFilterStatus(filterStatus === 'all' ? 'active' : 'all')}
            >
              <Filter className="w-4 h-4" />
              {filterStatus === 'all' ? 'הצג רק פעילים' : 'הצג הכל'}
            </Button>
            <Button 
              onClick={() => fetchUsers()} 
              variant="ghost"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {canManageUsers && (
              <Button 
                onClick={() => setShowAddModal(true)} 
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-4 h-4" />
                משתמש חדש
              </Button>
            )}
          </div>
        </div>
        
        {/* User Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>משתמש</TableHead>
                  <TableHead>אימייל</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>חבילה</TableHead>
                  <TableHead>אירועים</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700"></div>
                        <p className="mt-2 text-gray-500">טוען משתמשים...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center text-gray-500">
                        <Search className="h-10 w-10 mb-2" />
                        <p className="font-medium">לא נמצאו משתמשים</p>
                        <p className="text-sm">נסה לשנות את החיפוש או הפילטרים</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={user.status === 'suspended' ? 'bg-red-50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full overflow-hidden">
                            <img 
                              src={user.profile_image || 'https://via.placeholder.com/150'} 
                              alt={user.full_name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-xs text-gray-500">#{user.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                        {user.suspension_reason && (
                          <p className="text-xs text-red-600 mt-1">{user.suspension_reason}</p>
                        )}
                      </TableCell>
                      <TableCell>{getPlanBadge(user.plan)}</TableCell>
                      <TableCell>{user.events_count}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditUser(user)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {user.status === 'active' ? (
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleSuspendUser(user)}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  השעה משתמש
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-green-600"
                                  onClick={() => handleActivateUser(user)}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  הפעל משתמש
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => window.location.href = createPageUrl('ViewUser', { id: user.id })}>
                                הצג פרופיל מלא
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.location.href = createPageUrl('UserEvents', { id: user.id })}>
                                הצג אירועים
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                מחק משתמש
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* כאן יכול להיות מודל להוספת משתמש והודעות מערכת */}
      </div>
    </AdminLayout>
  );
}