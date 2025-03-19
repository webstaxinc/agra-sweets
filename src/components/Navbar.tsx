
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { getCurrentUser, logout } from '@/lib/storage';
import { getCartDetails } from '@/lib/storage';

const Navbar: React.FC = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const { items } = getCartDetails();
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm py-3 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-xl text-primary">SweetShop</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className="btn-ghost text-sm py-1.5">
                  Admin Dashboard
                </Link>
              ) : (
                <Link to="/cart" className="relative">
                  <ShoppingBag className="w-6 h-6 text-foreground" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="btn-ghost p-1.5 rounded-full"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="btn-ghost p-1.5 rounded-full"
              aria-label="Login"
            >
              <User className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
