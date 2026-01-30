import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Page } from '../types';
import Sidebar from '../components/Sidebar';
import DashboardPage from '../components/DashboardPage';
import ChatPage from '../components/ChatPage';
import ThumbGenPage from '../components/ThumbGenPage';
import StoryGenPage from '../components/StoryGenPage';
import ImageGenPage from '../components/ImageGenPage';
import VideoGenPage from '../components/VideoGenPage';
import ProfilePage from '../components/ProfilePage';
import { Language } from '../translations';

// Main App Component (Protected)
const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved as Language) || 'de';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_lang', language);
  }, [language]);

  const renderPage = () => {
    const commonProps = { language };

    switch (currentPage) {
      case Page.DASHBOARD:
        return <DashboardPage setCurrentPage={setCurrentPage} language={language} />;
      case Page.CHAT:
        return <ChatPage {...commonProps} />;
      case Page.THUMB_GEN:
        return <ThumbGenPage {...commonProps} />;
      case Page.STORY_GEN:
        return <StoryGenPage {...commonProps} />;
      case Page.IMAGE_GEN:
        return <ImageGenPage {...commonProps} />;
      case Page.VIDEO_GEN:
        return <VideoGenPage {...commonProps} />;
      case Page.PROFILE:
        return <ProfilePage {...commonProps} />;
      default:
        return <DashboardPage setCurrentPage={setCurrentPage} language={language} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        language={language}
        setLanguage={setLanguage}
        collapsed={isSidebarCollapsed}
        setCollapsed={setIsSidebarCollapsed}
      />
      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${(currentPage === Page.CHAT || currentPage === Page.THUMB_GEN || currentPage === Page.STORY_GEN || currentPage === Page.IMAGE_GEN || currentPage === Page.VIDEO_GEN || currentPage === Page.DASHBOARD) ? 'max-w-[1800px]' : 'max-w-7xl'
          }`}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

// Root App with Router and Auth
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to app */}
          <Route path="/" element={<Navigate to="/app" replace />} />

          {/* Catch all - redirect to app */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
