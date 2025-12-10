import React from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './contexts/AuthContext';
import { UserCircle } from 'lucide-react';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#f3f4f6] text-gray-800">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              🌍 No Crioulo
            </Link>
            
            <div className="flex items-center gap-4">
              {currentUser ? (
                <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-100 py-2 px-3 rounded-full transition-colors">
                  <span className="hidden sm:block text-sm font-medium">{currentUser.displayName}</span>
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                  ) : (
                    <UserCircle className="w-8 h-8 text-gray-500" />
                  )}
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-primary">
                    Entrar
                  </Link>
                  <Link to="/signup" className="px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors">
                    Criar Conta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
        
        <footer className="text-center py-6 text-gray-400 text-sm">
          <p>Feito com 💜 para a Guiné-Bissau e o mundo.</p>
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;