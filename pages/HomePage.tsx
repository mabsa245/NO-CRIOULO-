import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Copy, ThumbsUp, ThumbsDown, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import { useSpellCheck } from '../hooks/useSpellCheck';
import { translateText } from '../services/translationService';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [fromLang, setFromLang] = useState('detect');
  const [toLang, setToLang] = useState('pt');
  const [aiCorrection, setAiCorrection] = useState<string | null>(null);
  
  const { detectedLang } = useLanguageDetection(inputText);
  const spellSuggestions = useSpellCheck(inputText, detectedLang);

  // Auto-switch badge
  useEffect(() => {
    if (fromLang === 'detect' && detectedLang === 'kriol') {
      // Just visual indication, don't change state to avoid loops
    }
  }, [detectedLang, fromLang]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    setAiCorrection(null);
    
    try {
      const source = fromLang === 'detect' ? detectedLang : fromLang;
      const result = await translateText(inputText, source, toLang, currentUser?.uid);
      
      setOutputText(result.translation);
      if (result.correction) {
        setAiCorrection(result.correction);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTranslating(false);
    }
  };

  const applySuggestion = (original: string, suggestion: string) => {
    setInputText(prev => prev.replace(original, suggestion));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Tradutor Card */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-brand-accent w-6 h-6" />
          <h1 className="text-2xl font-bold text-gray-800">Tradutor Inteligente</h1>
          {detectedLang === 'kriol' && fromLang === 'detect' && (
             <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-semibold animate-fade-in">
               🇬🇼 Crioulo detectado
             </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select 
            value={fromLang} 
            onChange={(e) => setFromLang(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-brand-primary outline-none"
          >
            <option value="detect">Detectar idioma</option>
            <option value="kriol">🇬🇼 Crioulo (Guiné-Bissau)</option>
            <option value="pt">🇧🇷 Português</option>
            <option value="en">🇺🇸 Inglês</option>
          </select>

          <button className="p-3 rounded-full hover:bg-gray-100 transition-colors self-center rotate-90 md:rotate-0">
            <ArrowRightLeft className="w-5 h-5 text-gray-500" />
          </button>

          <select 
            value={toLang} 
            onChange={(e) => setToLang(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-brand-primary outline-none"
          >
            <option value="pt">🇧🇷 Português</option>
            <option value="kriol">🇬🇼 Crioulo (Guiné-Bissau)</option>
            <option value="en">🇺🇸 Inglês</option>
            <option value="fr">🇫🇷 Francês</option>
          </select>
        </div>

        {/* Input Area */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite aqui..."
              className="w-full h-48 p-4 rounded-xl border border-gray-200 resize-none focus:ring-2 focus:ring-brand-primary outline-none bg-white/50"
            />
            {/* Spell Check Suggestions */}
            {spellSuggestions.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm shadow-sm animate-slide-up">
                <div className="flex flex-wrap items-center gap-2">
                  <span>💡 Você quis dizer:</span>
                  {spellSuggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => applySuggestion(s.original, s.suggestion)}
                      className="font-bold text-yellow-700 hover:underline"
                    >
                      {s.suggestion}?
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="w-full h-48 p-4 rounded-xl bg-gray-50 border border-gray-100 relative">
              {isTranslating ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                </div>
              ) : (
                <>
                  <p className="text-gray-700 whitespace-pre-wrap">{outputText || "A tradução aparecerá aqui..."}</p>
                  {outputText && (
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500" title="Copiar">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-green-100 rounded-lg text-gray-500 hover:text-green-600" title="Útil">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg text-gray-500 hover:text-red-600" title="Não útil">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
             {aiCorrection && (
              <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                ✨ Sugestão de correção: <strong>{aiCorrection}</strong>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleTranslate}
          disabled={isTranslating || !inputText}
          className="w-full mt-6 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isTranslating ? 'Traduzindo...' : '🚀 Traduzir Agora'}
        </button>
      </div>

      {/* Top Words Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Palavras do dia
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Kuma', 'Obriguadu', 'Mindjer', 'Ermon', 'Tabanka'].map(word => (
              <button 
                key={word}
                onClick={() => setInputText(word)}
                className="px-4 py-2 bg-gray-100 hover:bg-brand-primary hover:text-white rounded-lg transition-colors text-sm font-medium"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {!currentUser && (
          <div className="bg-gradient-to-r from-brand-accent to-yellow-500 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-2">🎁 10 traduções grátis!</h3>
              <p className="mb-4 text-white/90">Cadastre-se para enviar dicionários PDF e ajudar a IA a aprender.</p>
              <button className="bg-white text-yellow-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-50">
                Criar Conta Grátis
              </button>
            </div>
            <BookOpen className="absolute -bottom-4 -right-4 w-32 h-32 text-white/20 rotate-12" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;