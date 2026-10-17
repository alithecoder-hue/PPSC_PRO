"use client";

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';
import { 
  LayoutDashboard, BookOpen, FileText, Megaphone, Users, 
  Menu, X, LogOut, FileBadge, Banknote, Inbox, LayoutTemplate, 
  ActivitySquare, Settings, Tag, Search, FolderOpen, Layers
} from 'lucide-react';

import { useAdminData } from './useAdminData';
import { useCommunications } from './hooks/useCommunications';

// Components
import OverviewTab from './components/OverviewTab';
import SubjectsDrilldownTab from './components/SubjectsDrilldownTab';
import SubjectsTab from './components/SubjectsTab';
import MockTestsTab from './components/MockTestsTab';
import PastPapersTab from './components/PastPapersTab';
import AnnouncementsJobsTab from './components/AnnouncementsJobsTab';
import SubscriptionsTab from './components/SubscriptionsTab';
import ContactMessagesTab from './components/ContactMessagesTab';
import ContentManagerTab from './components/ContentManagerTab';
import UsersTab from './components/UsersTab';
import ActivityLogTab from './components/ActivityLogTab';
import SettingsTab from './components/SettingsTab';
import PromotionsTab from './components/PromotionsTab';
import SeoManagerTab from './components/SeoManagerTab';
import MediaLibraryTab from './components/MediaLibraryTab';

export default function AdminPanel() {
  const router = useRouter();
  const [adminUser, setAdminUser] = React.useState<any>(null);
  const [checking, setChecking] = React.useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { stats } = useAdminData();
  const { messages } = useCommunications();

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch(API_BASE + '/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        if (data.role !== 'ADMIN') {
          // Not an admin — kick them out
          router.push('/');
          return;
        }
        setAdminUser(data);
      } catch {
        router.push('/login');
      } finally {
        setChecking(false);
      }
    };
    verifyAdmin();
  }, [router]);

  if (checking) return <div style={{ color: 'white', padding: '50px', textAlign: 'center', minHeight: '100vh' }}>Verifying admin access...</div>;
  if (!adminUser) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'subjects': return <SubjectsDrilldownTab />;
      case 'mcqs': return <SubjectsTab />;
      case 'mocktests': return <MockTestsTab />;
      case 'pastpapers': return <PastPapersTab />;
      case 'subscriptions': return <SubscriptionsTab />;
      case 'announcements': return <AnnouncementsJobsTab />;
      case 'inbox': return <ContactMessagesTab />;
      case 'content': return <ContentManagerTab />;
      case 'users': return <UsersTab />;
      case 'promotions': return <PromotionsTab />;
      case 'seo': return <SeoManagerTab />;
      case 'media': return <MediaLibraryTab />;
      case 'activity': return <ActivityLogTab />;
      case 'settings': return <SettingsTab />;
      default: return <OverviewTab />;
    }
  };

  const unreadCount = messages?.filter((m: any) => !m.isRead).length || 0;
  const userCount = stats?.totalUsers || 0;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects Manager', icon: Layers },
    { id: 'mcqs', label: 'MCQs Database', icon: BookOpen },
    { id: 'mocktests', label: 'Mock Tests', icon: FileText },
    { id: 'pastpapers', label: 'Past Papers', icon: FileBadge },
    { id: 'subscriptions', label: 'Revenue', icon: Banknote },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'announcements', label: 'News & Jobs', icon: Megaphone },
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: unreadCount, badgeClass: styles.unreadBadge },
    { id: 'content', label: 'Content Manager', icon: LayoutTemplate },
    { id: 'seo', label: 'SEO Settings', icon: Search },
    { id: 'media', label: 'Media Library', icon: FolderOpen },
    { id: 'users', label: 'User Management', icon: Users, badge: userCount, badgeClass: styles.countBadge },
    { id: 'activity', label: 'Activity Log', icon: ActivitySquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={styles.container}>
      
      {/* Top Header */}
      <header className={styles.topHeader}>
        <div className={styles.logoArea}>
          <h1 className={styles.headerTitle}>Merit<span>master</span></h1>
        </div>
        <div className={styles.adminProfileArea}>
          <div className={styles.adminInfo}>
            <div className={styles.avatar}>{adminUser?.name?.substring(0, 2).toUpperCase() || 'AD'}</div>
            <div>
              <div className={styles.adminName}>{adminUser?.name || 'Admin'}</div>
              <div className={styles.adminRole}>Super Admin</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}>
            <LogOut size={16} /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Layout Grid */}
      <div className={styles.grid}>
        
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Navigation</h3>
          <ul className={styles.menuList}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li 
                  key={item.id}
                  className={`${styles.menuItem} ${activeTab === item.id ? styles.activeLink : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                >
                  <Icon size={20} /> 
                  <span className={styles.linkLabel}>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className={item.badgeClass}>{item.badge}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main Content Area */}
        <section className={styles.mainContent}>
          {renderContent()}
        </section>

      </div>
    </div>
  );
}
