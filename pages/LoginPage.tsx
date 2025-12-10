import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-2 text-brand-secondary">Bem-vindo</h2>
        <p className="text-gray-500 mb-8">Entre para salvar seu histórico e contribuir.</p>
        
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Continuar com Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;