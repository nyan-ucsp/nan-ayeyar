import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Users, 
  UserCog,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const router = useRouter();
  const { logout } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
    },
    {
      name: 'Stock',
      href: '/stock',
      icon: Warehouse,
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: ShoppingCart,
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
    },
    {
      name: 'Admin Users',
      href: '/admin-users',
      icon: UserCog,
    },
    {
      name: 'Company Accounts',
      href: '/company-accounts',
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-admin-800 text-white transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-admin-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌾</span>
            </div>
            <span className="text-lg font-semibold">
              {process.env.NEXT_PUBLIC_ADMIN_APP_NAME}
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-admin-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href || 
            (item.href !== '/' && router.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-admin-200 hover:bg-admin-700 hover:text-white'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                'flex-shrink-0 h-5 w-5',
                isCollapsed ? 'mx-auto' : 'mr-3'
              )} />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-admin-700">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center w-full px-3 py-2 text-sm font-medium text-admin-200 rounded-md hover:bg-admin-700 hover:text-white transition-colors group',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className={cn(
            'flex-shrink-0 h-5 w-5',
            isCollapsed ? 'mx-auto' : 'mr-3'
          )} />
          {!isCollapsed && (
            <span className="truncate">Logout</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
