import { GoogleGenAI } from "@google/genai";
import { db, saveTranslationHistory } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é um especialista nativo em Crioulo da Guiné-Bissau (Kriol) e tradutor profissional.
Sua missão é traduzir textos com precisão cultural, mantendo o tom e o contexto.
REGRAS:
1. Se o input for Crioulo, detecte erros ortográficos comuns (ex: 'kaza' vs 'kasa', 'omi' vs 'homi') e corrija silenciosamente na tradução, mas note o erro.
2. Priorize a escrita fonética moderna do Crioulo da Guiné-Bissau.
3. Se a palavra tiver múltiplas variações aceitas, use a mais comum em Bissau.
4. Retorne apenas o JSON estrito.
`;

export interface TranslationResult {
  translation: string;
  source: 'ai' | 'dictionary';
  detectedLang: string;
  correction?: string;
}

export const translateText = async (
  text: string, 
  fromLang: string, 
  toLang: string, 
  userId?: string
): Promise<TranslationResult> => {
  
  // 1. Local/Firestore Vocabulary Check (Mocked for speed, would query DB here)
  // In a real app, we would cache high frequency words locally.
  const vocabQuery = query(
    collection(db, 'vocabulary'),
    where('word', '==', text.toLowerCase()),
    where('targetLang', '==', toLang)
  );
  
  try {
    const querySnapshot = await getDocs(vocabQuery);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0].data();
      if (userId) {
        saveTranslationHistory({
          userId,
          originalText: text,
          translatedText: doc.translation,
          fromLang,
          toLang,
          source: 'dictionary',
          wasHelpful: null
        });
      }
      return {
        translation: doc.translation,
        source: 'dictionary',
        detectedLang: fromLang === 'detect' ? 'kriol' : fromLang
      };
    }
  } catch (err) {
    console.warn("Firestore offline or empty, falling back to AI", err);
  }

  // 2. AI Translation
  try {
    const prompt = `
    Traduza o seguinte texto de ${fromLang === 'detect' ? 'Detectar Idioma (se parecer Crioulo, assuma Crioulo)' : fromLang} para ${toLang}.
    Texto: "${text}"
    
    Retorne um JSON com:
    {
      "translation": "texto traduzido",
      "detectedLang": "código do idioma detectado (ex: kriol, pt, en)",
      "correction": "sugestão de correção ortográfica se houver erro no original (ou null)"
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3
      }
    });

    const result = JSON.parse(response.text || '{}');

    if (userId) {
      saveTranslationHistory({
        userId,
        originalText: text,
        translatedText: result.translation,
        fromLang: result.detectedLang,
        toLang,
        source: 'ai',
        wasHelpful: null,
        hadSuggestions: !!result.correction
      });
    }

    return {
      translation: result.translation,
      source: 'ai',
      detectedLang: result.detectedLang,
      correction: result.correction
    };

  } catch (error) {
    console.error("AI Translation failed:", error);
    return {
      translation: "Erro ao traduzir. Tente novamente.",
      source: 'ai',
      detectedLang: 'unknown'
    };
  }
};