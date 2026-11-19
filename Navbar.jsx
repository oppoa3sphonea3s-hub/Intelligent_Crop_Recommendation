import React, { useState, useEffect } from 'react';
import { Sprout, Menu, X, Activity, Sparkles, Database, BarChart3, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ activePage, setActivePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  useEffect(() => {
    let isMounted = true;
    const checkServer = async () => {
      const res = await api.checkHealth();
      if (isMounted) {
        setBackendStatus(res.status === 'healthy' ? 'online' : 'offline');
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'crop-recommendation', label: 'Crop Prediction', icon: Sprout },
    { id: 'fertilizer', label: 'Fertilizer Advisor', icon: Sparkles },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActivePage('landing')} 
            className="flex items-center space-x-3 cursor-pointer group select-none py-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-800 to-fresh-400 flex items-center justify-center text-white shadow-md shadow-fresh-400/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="max-w-xs sm:max-w-md lg:max-w-lg">
              <span className="font-extrabold text-sm sm:text-base text-forest-800 tracking-tight leading-snug line-clamp-1">
                Intelligent Crop & Fertilizer Recommendation System
              </span>
              <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
                USING MACHINE LEARNING
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id || (item.id === 'crop-recommendation' && activePage === 'crop-result');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-forest-50 text-forest-800 font-semibold shadow-xs'
                      : 'text-gray-600 hover:text-forest-800 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Status & Action */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Backend health pill */}
            <div 
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                backendStatus === 'online'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : backendStatus === 'checking'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={backendStatus === 'online' ? 'Flask Backend & ML Models Online' : 'Connecting to Backend...'}
            >
              <span className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`}></span>
              <span>{backendStatus === 'online' ? 'ML Engine Live' : 'Backend Disconnected'}</span>
            </div>

            <button
              onClick={() => setActivePage('crop-recommendation')}
              className="px-4 py-2 rounded-lg bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all duration-150 flex items-center space-x-1.5"
            >
              <Sprout className="w-4 h-4" />
              <span>Predict Crop</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                activePage === item.id ? 'bg-forest-50 text-forest-800 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4 text-forest-600" />}
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => {
                setActivePage('crop-recommendation');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-lg bg-forest-800 text-white text-sm font-semibold flex items-center justify-center space-x-2"
            >
              <Sprout className="w-4 h-4" />
              <span>Start Crop Prediction</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
