import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Home() {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-app-bg">
      {/* Sidebar */}
      <div
        className={`${menuOpen ? 'flex' : 'hidden'} md:flex w-64 bg-app-sidebar text-white flex-col`}
      >
        <div className="px-8 py-4 text-2xl font-bold">BakeMate</div>
        <nav className="flex-grow">
          <Link to="/dashboard" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Dashboard</Link>
          <Link to="/recipes" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Recipes</Link>
          <Link to="/ingredients" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Ingredients</Link>
          <Link to="/orders" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Orders</Link>
          <Link to="/import" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Import</Link>
          <Link to="/pricing" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Pricing</Link>
          <Link to="/calendar" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Calendar</Link>
          <Link to="/expenses" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Expenses</Link>
          <Link to="/mileage" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Mileage</Link>
          <Link to="/reports" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Reports</Link>
          <Link to="/profile" className="block px-8 py-3 text-sm hover:bg-app-sidebarHover">Profile</Link>
          {/* Add more links as modules are created */}
        </nav>
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full px-4 py-2 font-bold text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-app-card shadow-md flex items-center justify-between px-6 py-4">
          <button
            className="md:hidden mr-4"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Welcome!</h1>
          <img src="/logo-placeholder.svg" alt="Logo" className="w-10 h-10" />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 max-w-7xl w-full mx-auto">
          <Outlet /> {/* Child routes will be rendered here */}
        </main>
      </div>
    </div>
  );
}
