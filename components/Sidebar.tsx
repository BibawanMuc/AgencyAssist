
import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { Language, translations } from '../translations';
import { useAuth } from '../src/hooks/useAuth';
import {
  MessageSquare,
  Image as ImageIcon,
  Clapperboard,
  Layout,
  Tv,
  Sparkles,
  Database,
  Trash2,
  Home,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, language, setLanguage, collapsed, setCollapsed }) => {
  const { user, signOut } = useAuth();
  const t = translations[language].sidebar;

  const navItems = [
    { id: Page.DASHBOARD, label: 'Dashboard', icon: Home, description: 'Command Center' },
    { id: Page.CHAT, label: t.chat, icon: MessageSquare, description: t.chatDesc },
    { id: Page.THUMB_GEN, label: t.thumb, icon: Tv, description: t.thumbDesc },
    { id: Page.STORY_GEN, label: t.story, icon: Layout, description: t.storyDesc },
    { id: Page.IMAGE_GEN, label: t.image, icon: ImageIcon, description: t.imageDesc },
    { id: Page.VIDEO_GEN, label: t.video, icon: Clapperboard, description: t.videoDesc },
  ];

  const languages: { id: Language, label: string }[] = [
    { id: 'en', label: 'EN' },
    { id: 'de', label: 'DE' },
    { id: 'fr', label: 'FR' },
    { id: 'es', label: 'ES' },
  ];

  const handleClearCache = async () => {
    window.location.reload();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0 transition-all duration-300 relative group/sidebar`}>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-white shadow-lg opacity-0 group-hover/sidebar:opacity-100 transition-opacity z-50"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="p-4 flex-1 flex flex-col items-center">
        <div className={`flex items-center gap-2 mb-8 ${collapsed ? 'justify-center' : ''} w-full transition-all`}>
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/20 shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
              PX-AIssistent
            </h1>
          )}
        </div>

        <div className={`mb-8 p-1 bg-slate-800/50 rounded-xl flex border border-slate-800 w-full ${collapsed ? 'flex-col gap-1' : ''}`}>
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${language === lang.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <nav className="space-y-2 overflow-y-auto flex-1 custom-scrollbar w-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${currentPage === item.id
                ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-[inset_0_0_10px_rgba(79,70,229,0.1)]'
                : 'hover:bg-slate-800 border-transparent text-slate-400'
                } border ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
              {!collapsed && (
                <div className="flex flex-col items-start ml-3 overflow-hidden">
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                  <span className="text-[10px] opacity-60 text-left line-clamp-1 whitespace-nowrap">{item.description}</span>
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className={`p-4 border-t border-slate-800 space-y-4 w-full`}>
        {/* User Profile Section */}
        {user && (
          <div className={`bg-slate-800/50 p-2 rounded-xl border border-slate-700/50 flex flex-col gap-2 ${collapsed ? 'items-center' : ''}`}>
            <button
              onClick={() => setCurrentPage(Page.PROFILE)}
              className={`flex items-center gap-3 w-full text-left hover:bg-slate-700/30 p-1 rounded-lg transition-colors group ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:border-indigo-500/60 transition-colors overflow-hidden shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate group-hover:text-slate-400">
                    {user.email}
                  </p>
                </div>
              )}
            </button>
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center justify-center gap-2 py-1.5 px-2 bg-slate-700/50 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-xs rounded-lg transition-all border border-transparent hover:border-red-500/20`}
              title="Sign Out"
            >
              <LogOut className="w-3 h-3 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        )}

        <div className={`bg-slate-800/50 p-3 rounded-xl space-y-3 ${collapsed ? 'hidden' : 'block'}`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
              <Database className="w-3 h-3 text-indigo-500" /> Storage
            </p>
            <button onClick={handleClearCache} className="p-1 hover:text-red-500 transition-colors" title="Clear All Cache">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-3/4"></div>
          </div>
          <p className="text-[9px] text-slate-500 font-bold uppercase">Supabase Cloud: Connected</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
