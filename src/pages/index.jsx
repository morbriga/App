import Layout from "./Layout.jsx";

import EventFeed from "./EventFeed";

import Home from "./Home";

import SelectPlan from "./SelectPlan";

import Payment from "./Payment";

import CreateEvent from "./CreateEvent";

import EventsDashboard from "./EventsDashboard";

import EventView from "./EventView";

import AdminPayments from "./AdminPayments";

import AdminLogin from "./AdminLogin";

import AdminDashboard from "./AdminDashboard";

import AdminLoginRedirect from "./AdminLoginRedirect";

import AdminLayout from "./AdminLayout";

import AdminUsers from "./AdminUsers";

import Welcome from "./Welcome";

import GuestEntry from "./GuestEntry";

import UserSettings from "./UserSettings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    EventFeed: EventFeed,
    
    Home: Home,
    
    SelectPlan: SelectPlan,
    
    Payment: Payment,
    
    CreateEvent: CreateEvent,
    
    EventsDashboard: EventsDashboard,
    
    EventView: EventView,
    
    AdminPayments: AdminPayments,
    
    AdminLogin: AdminLogin,
    
    AdminDashboard: AdminDashboard,
    
    AdminLoginRedirect: AdminLoginRedirect,
    
    AdminLayout: AdminLayout,
    
    AdminUsers: AdminUsers,
    
    Welcome: Welcome,
    
    GuestEntry: GuestEntry,
    
    UserSettings: UserSettings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<EventFeed />} />
                
                
                <Route path="/EventFeed" element={<EventFeed />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/SelectPlan" element={<SelectPlan />} />
                
                <Route path="/Payment" element={<Payment />} />
                
                <Route path="/CreateEvent" element={<CreateEvent />} />
                
                <Route path="/EventsDashboard" element={<EventsDashboard />} />
                
                <Route path="/EventView" element={<EventView />} />
                
                <Route path="/AdminPayments" element={<AdminPayments />} />
                
                <Route path="/AdminLogin" element={<AdminLogin />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/AdminLoginRedirect" element={<AdminLoginRedirect />} />
                
                <Route path="/AdminLayout" element={<AdminLayout />} />
                
                <Route path="/AdminUsers" element={<AdminUsers />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/GuestEntry" element={<GuestEntry />} />
                
                <Route path="/UserSettings" element={<UserSettings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}