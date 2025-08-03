'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Button, ThemeToggle } from './ui';
import { userOperations } from '../src/lib/database';
import { useAuth } from '../src/lib/auth';
import { useRouter } from 'next/navigation';
import { useRecommendationCount } from '../src/hooks/useRecommendationCount';

// Navigation items interface
interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  badge?: string | number;
  realTimeBadge?: boolean; // Indicates if badge should be real-time
}

// User data interface
interface UserData {
  name: string;
  businessName: string;
  email?: string;
}

// Layout component props
interface LayoutProps {
  children: React.ReactNode;
  /**
   * Current page for navigation highlighting
   */
  currentPage?: string;
  /**
   * Whether to show the sidebar navigation
   */
  showNav?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom navigation items
   */
  navItems?: NavItem[];
  /**
   * User ID for fetching user data
   */
  userId?: string;
}

// Default navigation items with icons and proper routing
const getDefaultNavItems = (recommendationCount = 0): NavItem[] => [
  { 
    label: 'Dashboard', 
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    )
  },
  { 
    label: 'Energy Usage', 
    href: '/dashboard/energy',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  { 
    label: 'Goals & Progress', 
    href: '/dashboard/goals',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  },
  { 
    label: 'Recommendations', 
    href: '/dashboard/recommendations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    badge: recommendationCount > 0 ? recommendationCount : undefined,
    realTimeBadge: true
  },
  { 
    label: 'Reports', 
    href: '/dashboard/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    label: 'Settings', 
    href: '/dashboard/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

// Icons
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EcoMindIcon = () => (
  <div className="flex items-center space-x-3">
    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
    <span className="text-xl font-bold text-gray-900">EcoMind</span>
  </div>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const NotificationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V5a2 2 0 012-2h10a2 2 0 012 2v6a6 6 0 01-6 6z" />
  </svg>
);

const SignOutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

/**
 * Sidebar Navigation Component
 */
const SidebarNavigation = ({ 
  currentPage, 
  navItems,
  collapsed = false,
  userData = null,
  onToggleCollapse
}: {
  currentPage?: string;
  navItems?: NavItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  userData?: UserData | null;
}) => {
  const { signOut, loading } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  return (
    <div className={cn(
      'bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col h-full transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                      {!collapsed && <EcoMindIcon />}
        {collapsed && (
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems?.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
              currentPage === item.href || item.isActive
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 border-primary-500'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100'
            )}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span className="ml-3 truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && item.badge && (
              <span className="absolute left-8 top-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="relative">
          {collapsed ? (
            /* Collapsed User Section */
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 p-0 rounded-full"
                title="User Menu"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon />
                </div>
              </Button>
            </div>
          ) : (
            /* Expanded User Section */
            <div>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon />
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {userData?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {userData?.businessName || 'Your Business'}
                  </p>
                </div>
                <ChevronUpIcon />
              </button>

              {/* Quick Actions */}
              <div className="mt-2 space-y-1">
                <div className="px-2 py-1">
                  <ThemeToggle variant="segmented" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <SignOutIcon />
                  <span className="ml-2">
                    {loading ? 'Signing out...' : 'Sign out'}
                  </span>
                </Button>
              </div>
            </div>
          )}

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className={cn(
              'absolute bottom-full mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600 py-1 z-50',
              collapsed ? 'left-12 w-48' : 'left-0 right-0'
            )}>
              <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-600">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userData?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userData?.email || 'user@example.com'}
                </p>
              </div>
              
              <a
                href="/dashboard/settings"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => setShowUserMenu(false)}
              >
                Settings
              </a>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  handleSignOut();
                }}
                disabled={loading}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {loading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile Sidebar Overlay
 */
const MobileSidebar = ({ 
  isOpen, 
  onClose, 
  currentPage, 
  navItems,
  userData = null
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  navItems?: NavItem[];
  userData?: UserData | null;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative flex flex-col w-64 max-w-xs bg-white h-full shadow-xl">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <CloseIcon />
          </Button>
        </div>
        
        <SidebarNavigation currentPage={currentPage} navItems={navItems} userData={userData} collapsed={false} />
      </div>
    </div>
  );
};

/**
 * Top Bar for Mobile and Collapse Toggle
 */
const TopBar = ({ 
  onMobileMenuToggle, 
  onSidebarToggle, 
  sidebarCollapsed 
}: { 
  onMobileMenuToggle: () => void;
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 lg:hidden transition-colors">
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="lg:hidden"
        >
          <MenuIcon />
        </Button>
        
                      <EcoMindIcon />
        
        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" size="sm" />
          <Button variant="ghost" size="sm">
            <NotificationIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Content Area Component
 */
const MainContent = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  return (
    <main className={cn('flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen transition-colors', className)}>
      <div className="h-full px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
};

/**
 * Layout Component
 * 
 * Main layout wrapper with responsive sidebar navigation, content area.
 * Provides consistent structure across all application pages.
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  showNav = true,
  className,
  navItems,
  userId
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Get real-time recommendation count
  const { count: recommendationCount } = useRecommendationCount(userId, 30000); // Refresh every 30 seconds

  // Generate navigation items with real-time recommendation count
  const finalNavItems = navItems || getDefaultNavItems(recommendationCount.total);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const result = await userOperations.getProfile(userId);
          if (result.success && result.data) {
            setUserData({
              name: `${result.data.first_name || ''} ${result.data.last_name || ''}`.trim() || result.data.email?.split('@')[0] || 'User',
              businessName: result.data.business_name || 'Your Business',
              email: result.data.email
            });
          } else {
            // Fallback to empty state if profile doesn't exist yet
            setUserData({
              name: 'User',
              businessName: 'Your Business',
              email: ''
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set fallback data on error
          setUserData({
            name: 'User',
            businessName: 'Your Business',
            email: ''
          });
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (!showNav) {
    return (
      <div className={cn('min-h-screen bg-gray-50', className)}>
        <MainContent>{children}</MainContent>
      </div>
    );
  }

  return (
    <div className={cn('h-screen flex bg-gray-50', className)}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <SidebarNavigation 
          currentPage={currentPage} 
          navItems={finalNavItems}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          userData={userData}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPage={currentPage}
        navItems={finalNavItems}
        userData={userData}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Bar for Mobile */}
        <TopBar
          onMobileMenuToggle={toggleMobileSidebar}
          onSidebarToggle={toggleSidebarCollapse}
          sidebarCollapsed={isSidebarCollapsed}
        />

        {/* Main Content */}
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};

Layout.displayName = 'Layout';

// Export sub-components for advanced usage
export { SidebarNavigation, MainContent };

// Export types
export type { LayoutProps, NavItem }; 